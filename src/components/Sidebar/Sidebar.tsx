import { PanelLeftClose, PanelLeftOpen, RefreshCw, BookOpen } from 'lucide-react';
import SearchBar from './SearchBar';
import DocItem from './DocItem';
import type { PDFDoc } from '../../types';

interface Props {
  docs: PDFDoc[];
  activeId: string | null;
  loading: boolean;
  error: string | null;
  collapsed: boolean;
  mobileOpen: boolean;
  filter: string;
  onFilter: (v: string) => void;
  onSelect: (doc: PDFDoc) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onReload: () => void;
}

export default function Sidebar({
  docs,
  activeId,
  loading,
  error,
  collapsed,
  mobileOpen,
  filter,
  onFilter,
  onSelect,
  onToggleCollapse,
  onCloseMobile,
  onReload,
}: Props) {
  const filtered = docs.filter((d) =>
    d.cleanName.toLowerCase().includes(filter.toLowerCase()),
  );

  const header = (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-2 overflow-hidden">
        <BookOpen className="h-6 w-6 shrink-0 text-white" aria-hidden />
        {!collapsed && (
          <span className="truncate text-base font-semibold text-white">Biblioteca</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onReload}
          aria-label="Recarregar lista"
          className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden xl:block"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="hidden rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white lg:block"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <button
          onClick={onCloseMobile}
          aria-label="Fechar menu"
          className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const body = (
    <div className="flex h-full flex-col">
      {!collapsed && (
        <div className="px-4 pb-3">
          <SearchBar value={filter} onChange={onFilter} />
        </div>
      )}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4" aria-label="Lista de documentos">
        {loading && (
          <div className="space-y-2 px-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        )}
        {!loading && error && (
          <div className="px-3 py-6 text-center text-sm text-red-200">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-white/40">
            {docs.length === 0 ? 'Nenhum documento disponível.' : 'Nenhum resultado.'}
          </div>
        )}
        {!loading &&
          !error &&
          filtered.map((doc) => (
            <DocItem
              key={doc.id}
              doc={doc}
              active={doc.id === activeId}
              onClick={() => onSelect(doc)}
            />
          ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`relative z-20 hidden shrink-0 overflow-hidden border-r border-white/10 bg-[#173044] transition-all duration-300 lg:block ${
          collapsed ? 'w-[68px]' : 'w-72'
        }`}
      >
        {header}
        {body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-hidden border-r border-white/10 bg-[#173044] shadow-2xl">
            {header}
            {body}
          </aside>
        </div>
      )}
    </>
  );
}
