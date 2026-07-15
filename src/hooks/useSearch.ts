import { useCallback, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { extractAllText, searchInPages } from '../services/textExtractor';
import type { SearchMatch } from '../types';

export function useSearch(doc: PDFDocumentProxy | null) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pagesTextRef = useRef<string[] | null>(null);

  const ensureText = useCallback(async () => {
    if (!doc) return null;
    if (pagesTextRef.current) return pagesTextRef.current;
    setExtracting(true);
    setExtractProgress(0);
    try {
      const pages = await extractAllText(doc, (current, total) => {
        setExtractProgress(Math.round((current / total) * 100));
      });
      pagesTextRef.current = pages;
      return pages;
    } catch {
      setError('Falha ao extrair texto do documento.');
      return null;
    } finally {
      setExtracting(false);
    }
  }, [doc]);

  const runSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      setError(null);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setSearching(true);
      const pages = await ensureText();
      if (pages) {
        setResults(searchInPages(pages, q));
      }
      setSearching(false);
    },
    [ensureText],
  );

  const reset = useCallback(() => {
    pagesTextRef.current = null;
    setResults([]);
    setQuery('');
    setError(null);
    setExtractProgress(0);
  }, []);

  return {
    query,
    results,
    searching,
    extracting,
    extractProgress,
    error,
    runSearch,
    reset,
  };
}
