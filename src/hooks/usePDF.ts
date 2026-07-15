import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPdf } from '../services/pdfRenderer';
import { clearRenderCache } from '../utils/cache';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export function usePDF(url: string | null) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async (u: string) => {
    setLoading(true);
    setError(null);
    clearRenderCache();
    try {
      const pdf = await loadPdf(u);
      if (!mounted.current) return;
      setDoc(pdf);
      setNumPages(pdf.numPages);
    } catch (e) {
      if (!mounted.current) return;
      setError(
        e instanceof Error
          ? `Não foi possível abrir o PDF: ${e.message}`
          : 'Arquivo PDF corrompido ou inválido.',
      );
      setDoc(null);
      setNumPages(0);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (url) void load(url);
    else {
      setDoc(null);
      setNumPages(0);
      setLoading(false);
      setError(null);
    }
    return () => {
      mounted.current = false;
    };
  }, [url, load]);

  return { doc, numPages, loading, error };
}
