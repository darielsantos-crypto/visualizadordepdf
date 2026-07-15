import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPage } from '../../services/pdfRenderer';
import { getRenderedPage, setRenderedPage } from '../../utils/cache';
import { PAGE_RENDER_SCALE } from '../../utils/constants';

interface Props {
  doc: PDFDocumentProxy;
  pageIndex: number;
  zoom: number;
  highlight?: string | null;
}

export default function PDFPage({ doc, pageIndex, zoom, highlight }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const page = await doc.getPage(pageIndex + 1);
        if (cancelled) return;

        const scale = PAGE_RENDER_SCALE * zoom;
        const cached = getRenderedPage(pageIndex);
        if (cached) {
          container.replaceChildren(cached);
          setLoading(false);
          return;
        }

        const { canvas } = await renderPage(page, scale);
        if (cancelled) return;
        canvas.className = 'pdf-canvas';
        setRenderedPage(pageIndex, canvas);
        container.replaceChildren(canvas);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Falha ao renderizar página.');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, pageIndex, zoom]);

  return (
    <div className="pdf-page-wrapper" data-page={pageIndex + 1}>
      <div
        ref={containerRef}
        className="relative mx-auto flex items-center justify-center bg-white"
        style={{ boxShadow: '0 18px 45px rgba(0,0,0,0.5)' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#004883] border-t-transparent" />
          </div>
        )}
        {error && (
          <div className="flex h-48 items-center justify-center text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
      {highlight && (
        <div className="sr-only">{highlight}</div>
      )}
    </div>
  );
}
