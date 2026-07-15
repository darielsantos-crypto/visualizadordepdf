import { useCallback, useEffect, useState } from 'react';
import { fetchPdfList } from '../services/githubApi';
import type { PDFDoc } from '../types';

export function usePDFList() {
  const [docs, setDocs] = useState<PDFDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPdfList(force);
      setDocs(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido ao listar PDFs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { docs, loading, error, reload: load };
}
