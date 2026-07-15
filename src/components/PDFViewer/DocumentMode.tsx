import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPage } from '../../services/pdfRenderer';

interface Props {
  doc: PDFDocumentProxy;
  currentPage: number;
  zoom: number;
  onPageChange: (page: number) => void;
}

interface PageDim {
  width: number;
  height: number;
}

export default function DocumentMode({ doc, currentPage, zoom, onPageChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dims, setDims] = useState<PageDim[]>([]);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d: PageDim[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelled) return;
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        d.push({ width: vp.width, height: vp.height });
      }
      if (!cancelled) setDims(d);
    })();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  useEffect(() => {
    setLoaded(new Set());
  }, [doc, zoom]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || dims.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLDivElement).dataset.index);
            setLoaded((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
          }
        });
      },
      { root, rootMargin: '700px 0px', threshold: 0.01 },
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [dims]);

  useEffect(() => {
    const el = pageRefs.current[currentPage];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, dims]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const top = root.getBoundingClientRect().top + 24;
        let best = 0;
        let dist = Infinity;
        pageRefs.current.forEach((el, i) => {
          if (!el) return;
          const d = Math.abs(el.getBoundingClientRect().top - top);
          if (d < dist) {
            dist = d;
            best = i;
          }
        });
        if (best !== currentPage) onPageChange(best);
        ticking = false;
      });
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims, currentPage]);

  const containerWidth = Math.min(940, (scrollRef.current?.clientWidth ?? 800) - 48) * zoom;

  return (
    <div ref={scrollRef} className="document-stage stage-scroll">
      <div className="document-stack">
        {dims.map((dim, i) => {
          const ratio = dim.height / dim.width;
          const w = containerWidth || dim.width * zoom;
          const h = w * ratio;
          return (
            <div
              key={i}
              ref={(el) => {
                pageRefs.current[i] = el;
              }}
              data-index={i}
              className="document-placeholder"
              style={{ width: w, height: h }}
            >
              {loaded.has(i) ? (
                <RenderedPage doc={doc} index={i} zoom={zoom} width={w} height={h} />
              ) : (
                <div className="page-loading">Carregando página {i + 1}…</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RenderedPage({
  doc,
  index,
  zoom,
  width,
  height,
}: {
  doc: PDFDocumentProxy;
  index: number;
  zoom: number;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await doc.getPage(index + 1);
        if (cancelled) return;
        const { canvas } = await renderPage(page, zoom * 1.5);
        if (cancelled) return;
        canvas.className = 'pdf-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        if (ref.current) {
          ref.current.replaceChildren(canvas);
          setStatus('done');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, index, zoom]);

  return (
    <div
      ref={ref}
      className="pdf-page"
      style={{ width, height }}
    >
      {status === 'loading' && (
        <div className="page-loading">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#004883] border-t-transparent" />
        </div>
      )}
      {status === 'error' && <div className="page-loading text-red-500">Erro ao renderizar.</div>}
    </div>
  );
}
