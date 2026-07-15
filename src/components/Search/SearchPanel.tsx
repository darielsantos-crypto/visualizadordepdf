import { useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import type { SearchMatch } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  query: string;
  onQuery: (q: string) => void;
  results: SearchMatch[];
  searching: boolean;
  extracting: boolean;
  extractProgress: number;
  error: string | null;
  onResultClick: (pageIndex: number) => void;
}

export default function SearchPanel({
  open,
  onClose,
  query,
  onQuery,
  results,
  searching,
  extracting,
  extractProgress,
  error,
  onResultClick,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-panel" role="dialog" aria-label="Busca no documento">
      <div className="search-head">
        <div className="search-input-wrap">
          <Search className="h-4 w-4 text-[#173044]/50" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Pesquisar palavra ou expressão…"
            aria-label="Buscar no documento"
          />
          <button onClick={onClose} aria-label="Fechar busca" className="search-close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="search-results">
        {extracting && (
          <div className="search-status">
            <Loader2 className="h-4 w-4 animate-spin" /> Indexando documento… {extractProgress}%
          </div>
        )}
        {error && <div className="search-status text-red-500">{error}</div>}
        {!extracting && !error && query.trim().length > 0 && results.length === 0 && !searching && (
          <div className="search-status">Nenhuma ocorrência encontrada.</div>
        )}
        {!extracting && !error && query.trim().length === 0 && (
          <div className="search-status">Digite para pesquisar em todo o documento.</div>
        )}
        {results.map((m, i) => (
          <button key={i} className="result" onClick={() => onResultClick(m.pageIndex)}>
            <b>Página {m.pageIndex + 1}</b>
            <span>{m.snippet}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
