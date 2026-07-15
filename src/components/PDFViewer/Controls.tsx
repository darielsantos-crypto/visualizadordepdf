import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  BookOpen,
  ScrollText,
  Search,
} from 'lucide-react';
import type { ViewMode } from '../../types';

interface Props {
  currentPage: number;
  numPages: number;
  zoom: number;
  viewMode: ViewMode;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMode: () => void;
  onOpenSearch: () => void;
}

export default function Controls({
  currentPage,
  numPages,
  zoom,
  viewMode,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onZoomIn,
  onZoomOut,
  onToggleMode,
  onOpenSearch,
}: Props) {
  const btn =
    'flex items-center justify-center rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/10 bg-[#173044]/95 px-3 py-2 shadow-xl backdrop-blur sm:gap-2">
      <button onClick={onFirst} disabled={currentPage <= 0} aria-label="Primeira página" className={btn}>
        <ChevronFirst className="h-5 w-5" />
      </button>
      <button onClick={onPrev} disabled={currentPage <= 0} aria-label="Página anterior" className={btn}>
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="min-w-[90px] text-center text-sm font-medium text-white">
        Página {Math.min(currentPage + 1, numPages || 1)} de {numPages || '—'}
      </span>

      <button onClick={onNext} disabled={currentPage >= numPages - 1} aria-label="Próxima página" className={btn}>
        <ChevronRight className="h-5 w-5" />
      </button>
      <button onClick={onLast} disabled={currentPage >= numPages - 1} aria-label="Última página" className={btn}>
        <ChevronLast className="h-5 w-5" />
      </button>

      <div className="mx-1 h-6 w-px bg-white/15" />

      <button onClick={onZoomOut} aria-label="Diminuir zoom" className={btn}>
        <Minus className="h-5 w-5" />
      </button>
      <span className="min-w-[48px] text-center text-sm font-medium text-white">
        {Math.round(zoom * 100)}%
      </span>
      <button onClick={onZoomIn} aria-label="Aumentar zoom" className={btn}>
        <Plus className="h-5 w-5" />
      </button>

      <div className="mx-1 h-6 w-px bg-white/15" />

      <button
        onClick={onToggleMode}
        aria-label="Alternar modo de visualização"
        className={btn}
        title={viewMode === 'book' ? 'Modo documento' : 'Modo livreto'}
      >
        {viewMode === 'book' ? <ScrollText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
      </button>
      <button onClick={onOpenSearch} aria-label="Buscar no documento" className={btn}>
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
