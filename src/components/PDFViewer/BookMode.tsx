import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPage } from '../../services/pdfRenderer';
import { throttle } from '../../utils/helpers';

interface Props {
  doc: PDFDocumentProxy;
  currentPage: number;
  zoom: number;
  onPageChange: (page: number) => void;
}

interface PageSize {
  width: number;
  height: number;
}

export default function BookMode({ doc, currentPage, zoom, onPageChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlipInstance | null>(null);
  const [pageSizes, setPageSizes] = useState<PageSize[]>([]);
  const [ready, setReady] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Preparando páginas…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sizes: PageSize[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelled) return;
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        sizes.push({ width: vp.width, height: vp.height });
      }
      if (!cancelled) setPageSizes(sizes);
    })();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  const computeDims = (): { width: number; height: number } => {
    const stage = stageRef.current;
    const ratio = pageSizes[0] ? pageSizes[0].height / pageSizes[0].width : 1.4142;
    const availableW = Math.max(280, (stage?.clientWidth ?? 800) - 42);
    const availableH = Math.max(300, (stage?.clientHeight ?? 600) - 42);
    const mobile = availableW < 760;
    let pageHeight = Math.max(300, availableH);
    let pageWidth = pageHeight / ratio;
    const spreadWidth = mobile ? pageWidth : pageWidth * 2;
    if (spreadWidth > availableW) {
      pageWidth = availableW / (mobile ? 1 : 2);
      pageHeight = pageWidth * ratio;
    }
    return { width: Math.max(220, pageWidth * zoom), height: Math.max(220, pageWidth * ratio * zoom) };
  };

  useEffect(() => {
    if (pageSizes.length === 0) return;
    let cancelled = false;

    (async () => {
      setReady(false);
      setLoadingMsg('Preparando páginas…');

      // destroy previous
      try {
        pageFlipRef.current?.destroy();
      } catch {
        // ignore
      }
      pageFlipRef.current = null;
      const root = rootRef.current;
      if (root) root.innerHTML = '';

      const { width, height } = computeDims();
      const fragment = document.createDocumentFragment();

      for (let index = 0; index < doc.numPages; index++) {
        if (cancelled) return;
        if (index % 5 === 0) setLoadingMsg(`Preparando página ${index + 1} de ${doc.numPages}…`);

        const pageEl = document.createElement('div');
        pageEl.className = 'flip-page';
        pageEl.dataset.density = index === 0 || index === doc.numPages - 1 ? 'hard' : 'soft';
        pageEl.style.width = `${width}px`;
        pageEl.style.height = `${height}px`;

        const page = await doc.getPage(index + 1);
        if (cancelled) return;
        const { canvas } = await renderPage(page, zoom * 1.5);
        if (cancelled) return;
        canvas.className = 'pdf-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        pageEl.appendChild(canvas);
        fragment.appendChild(pageEl);

        if ((index + 1) % 3 === 0) await new Promise((r) => requestAnimationFrame(r));
      }

      if (cancelled || !root) return;
      root.appendChild(fragment);

      const PageFlip = (await import('page-flip')).default;
      const pf = new PageFlip(root, {
        width: Math.floor(width),
        height: Math.floor(height),
        size: 'stretch',
        minWidth: 220,
        maxWidth: Math.floor(width),
        minHeight: 300,
        maxHeight: Math.floor(height),
        showCover: true,
        usePortrait: true,
        mobileScrollSupport: false,
        maxShadowOpacity: 0.18,
        flippingTime: 720,
        drawShadow: false,
        autoSize: true,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 22,
        showPageCorners: true,
        disableFlipByClick: false,
      });

      pf.loadFromHTML(root.querySelectorAll('.flip-page'));
      pf.on('flip', (e: { data: number }) => {
        onPageChange(e.data);
      });
      pf.on('changeOrientation', () => {
        onPageChange(pf.getCurrentPageIndex());
      });
      pf.turnToPage(Math.min(currentPage, doc.numPages - 1));
      pageFlipRef.current = pf;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      try {
        pageFlipRef.current?.destroy();
      } catch {
        // ignore
      }
      pageFlipRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, pageSizes, zoom]);

  // navigate when currentPage changes externally
  useEffect(() => {
    const pf = pageFlipRef.current;
    if (pf && ready) {
      const cur = pf.getCurrentPageIndex();
      if (cur !== currentPage) {
        pf.turnToPage(currentPage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, ready]);

  // resize handler
  useEffect(() => {
    const onResize = throttle(() => {
      const pf = pageFlipRef.current;
      if (pf && rootRef.current) {
        const { width, height } = computeDims();
        pf.update();
        void width;
        void height;
      }
    }, 200);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSizes, zoom]);

  return (
    <div ref={stageRef} className="book-stage stage-scroll">
      <div className="book-center">
        {!ready && (
          <div className="flex flex-col items-center gap-3 text-white/70">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <span className="text-sm">{loadingMsg}</span>
          </div>
        )}
        <div
          ref={rootRef}
          className="flip-book-root"
          style={{ filter: 'drop-shadow(0 24px 28px rgba(0,0,0,.34))' }}
        />
      </div>
    </div>
  );
}

interface PageFlipInstance {
  loadFromHTML(elements: NodeListOf<Element>): void;
  on(event: string, cb: (e: { data: number }) => void): void;
  turnToPage(index: number): void;
  flipNext(): void;
  flipPrev(): void;
  getCurrentPageIndex(): number;
  getPageCount(): number;
  update(): void;
  destroy(): void;
}
