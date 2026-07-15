import { Menu, Search, Download, Maximize, BookOpen, ScrollText } from 'lucide-react';
import type { ViewMode } from '../../types';

interface Props {
  title: string;
  subtitle: string;
  viewMode: ViewMode;
  onToggleMode: () => void;
  onOpenSearch: () => void;
  onDownload: () => void;
  onFullscreen: () => void;
  onOpenMobileMenu: () => void;
}

export default function Header({
  title,
  subtitle,
  viewMode,
  onToggleMode,
  onOpenSearch,
  onDownload,
  onFullscreen,
  onOpenMobileMenu,
}: Props) {
  return (
    <header className="topbar">
      <button
        onClick={onOpenMobileMenu}
        aria-label="Abrir menu"
        className="topbar-menu-btn lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="title">
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>

      <div className="top-right">
        <div className="mode-toggle">
          <button
            className={viewMode === 'book' ? 'active' : ''}
            onClick={onToggleMode}
            aria-label="Modo livreto"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Livreto</span>
          </button>
          <button
            className={viewMode === 'document' ? 'active' : ''}
            onClick={onToggleMode}
            aria-label="Modo documento"
          >
            <ScrollText className="h-4 w-4" />
            <span className="hidden sm:inline">Documento</span>
          </button>
        </div>

        <button className="tool" onClick={onOpenSearch} aria-label="Pesquisar no documento">
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Pesquisar</span>
        </button>

        <button className="tool" onClick={onDownload} aria-label="Baixar PDF">
          <Download className="h-4 w-4" />
        </button>

        <button className="tool" onClick={onFullscreen} aria-label="Tela cheia">
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
