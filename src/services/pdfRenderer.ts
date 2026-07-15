import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import type { PageRenderResult } from '../types';

// Mantém a biblioteca principal e o worker exatamente na mesma versão.
// A versão 3.11.174 é a mesma utilizada no visualizador HTML que já abria
// corretamente os PDFs e evita o erro "toHex is not a function".
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function loadPdf(url: string): Promise<PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({
    url,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
    disableFontFace: false,
    disableAutoFetch: false,
    disableStream: false,
  });
  return loadingTask.promise;
}

export async function renderPage(
  page: PDFPageProxy,
  scale: number,
): Promise<PageRenderResult> {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = page.getViewport({ scale: scale * dpr });
  const cssViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context indisponível.');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderTask: RenderTask = page.render({
    canvasContext: ctx,
    viewport,
    background: '#fff',
  });
  await renderTask.promise;

  const textLayerDiv = document.createElement('div');
  textLayerDiv.className = 'text-layer';
  textLayerDiv.style.width = `${Math.floor(cssViewport.width)}px`;
  textLayerDiv.style.height = `${Math.floor(cssViewport.height)}px`;
  textLayerDiv.style.setProperty('--scale-factor', String(cssViewport.scale));

  const textContent = await page.getTextContent();
  const textTask = pdfjsLib.renderTextLayer({
    textContentSource: textContent,
    container: textLayerDiv,
    viewport: cssViewport,
    textDivs: [],
  });
  await textTask.promise;

  return { canvas, textLayerDiv, width: cssViewport.width, height: cssViewport.height };
}

export async function getPageText(page: PDFPageProxy): Promise<string> {
  const content = await page.getTextContent();
  return content.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export { pdfjsLib };
