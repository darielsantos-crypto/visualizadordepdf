import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Controls from './components/PDFViewer/Controls';
import BookMode from './components/PDFViewer/BookMode';
import DocumentMode from './components/PDFViewer/DocumentMode';
import SearchPanel from './components/Search/SearchPanel';
import { usePDFList } from './hooks/usePDFList';
import { usePDF } from './hooks/usePDF';
import { useSearch } from './hooks/useSearch';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_PREFS, PREFS_KEY, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from './utils/constants';
import type { PDFDoc, ViewMode } from './types';

export default function App() {
  const { docs, loading: listLoading, error: listError, reload } = usePDFList();
  const [activeDoc, setActiveDoc] = useState<PDFDoc | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const [prefs, updatePrefs] = useLocalStorage(PREFS_KEY, DEFAULT_PREFS);

  const pdfUrl = activeDoc?.downloadUrl ?? null;
  const { doc, numPages, loading: pdfLoading, error: pdfError } = usePDF(pdfUrl);

  const search = useSearch(doc);

  // Auto-select first doc or last opened
  useEffect(() => {
    if (docs.length === 0) return;
    if (activeDoc) return;
    const last = prefs.lastDocId ? docs.find((d) => d.id === prefs.lastDocId) : null;
    const target = last ?? docs[0];
    setActiveDoc(target);
    const savedPage = prefs.pageByDoc[target.id] ?? 0;
    setCurrentPage(savedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs]);

  // Persist preferences
  useEffect(() => {
    if (activeDoc) updatePrefs({ lastDocId: activeDoc.id });
  }, [activeDoc, updatePrefs]);

  useEffect(() => {
    if (activeDoc && numPages > 0) {
      updatePrefs({ pageByDoc: { ...prefs.pageByDoc, [activeDoc.id]: currentPage } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeDoc, numPages]);

  const handleSelectDoc = useCallback(
    (d: PDFDoc) => {
      setActiveDoc(d);
      setCurrentPage(prefs.pageByDoc[d.id] ?? 0);
      setMobileMenuOpen(false);
      search.reset();
    },
    [prefs.pageByDoc, search],
  );

  const goFirst = useCallback(() => setCurrentPage(0), []);
  const goLast = useCallback(() => setCurrentPage(Math.max(0, numPages - 1)), [numPages]);
  const goPrev = useCallback(() => setCurrentPage((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setCurrentPage((p) => Math.min(numPages - 1, p + 1)), [numPages]);

  const zoomIn = useCallback(() => {
    updatePrefs({ zoom: Math.min(ZOOM_MAX, prefs.zoom + ZOOM_STEP) });
  }, [prefs.zoom, updatePrefs]);
  const zoomOut = useCallback(() => {
    updatePrefs({ zoom: Math.max(ZOOM_MIN, prefs.zoom - ZOOM_STEP) });
  }, [prefs.zoom, updatePrefs]);

  const toggleMode = useCallback(() => {
    const next: ViewMode = prefs.viewMode === 'book' ? 'document' : 'book';
    updatePrefs({ viewMode: next });
    setCurrentPage(currentPage);
  }, [prefs.viewMode, updatePrefs, currentPage]);

  const handleDownload = useCallback(async () => {
    if (!activeDoc) return;
    try {
      const r = await fetch(activeDoc.downloadUrl);
      const blob = await r.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = activeDoc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 1000);
    } catch {
      window.open(activeDoc.downloadUrl, '_blank');
    }
  }, [activeDoc]);

  const handleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // ignore
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        return;
      }
      if ((e.key === 'f' || e.key === 'F') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
        return;
      }
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goFirst();
      } else if (e.key === 'End') {
        e.preventDefault();
        goLast();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, goFirst, goLast, zoomIn, zoomOut]);

  const subtitle = useMemo(() => {
    if (!activeDoc) return '';
    return numPages ? `${numPages} páginas` : '';
  }, [activeDoc, numPages]);

  const showStage = activeDoc && !pdfError;
  const viewMode = prefs.viewMode;

  return (
    <div className="app-root">
      <Sidebar
        docs={docs}
        activeId={activeDoc?.id ?? null}
        loading={listLoading}
        error={listError}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        filter={filter}
        onFilter={setFilter}
        onSelect={handleSelectDoc}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onReload={() => reload(true)}
      />

      <section className="viewer">
        <Header
          title={activeDoc?.cleanName ?? 'Biblioteca Corporativa'}
          subtitle={subtitle}
          viewMode={viewMode}
          onToggleMode={toggleMode}
          onOpenSearch={() => setSearchOpen(true)}
          onDownload={handleDownload}
          onFullscreen={handleFullscreen}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <section className="stage" aria-label="Área de leitura">
          <div className="stage-center">
            {pdfLoading && (
              <div className="loader-overlay">
                <div className="load">
                  <div className="spinner" />
                  <b>Abrindo documento</b>
                  <span>Carregando…</span>
                </div>
              </div>
            )}

            {pdfError && (
              <div className="error-box">
                <h2>Não foi possível abrir</h2>
                <p>{pdfError}</p>
              </div>
            )}

            {!activeDoc && !listLoading && !listError && (
              <div className="empty-state">
                <p>Selecione um documento na biblioteca para começar a leitura.</p>
              </div>
            )}

            {showStage && doc && viewMode === 'book' && (
              <BookMode
                doc={doc}
                currentPage={currentPage}
                zoom={prefs.zoom}
                onPageChange={setCurrentPage}
              />
            )}

            {showStage && doc && viewMode === 'document' && (
              <DocumentMode
                doc={doc}
                currentPage={currentPage}
                zoom={prefs.zoom}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          <SearchPanel
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            query={search.query}
            onQuery={(q) => search.runSearch(q)}
            results={search.results}
            searching={search.searching}
            extracting={search.extracting}
            extractProgress={search.extractProgress}
            error={search.error}
            onResultClick={(idx) => {
              setCurrentPage(idx);
              setSearchOpen(false);
            }}
          />
        </section>

        <Footer>
          <Controls
            currentPage={currentPage}
            numPages={numPages}
            zoom={prefs.zoom}
            viewMode={viewMode}
            onFirst={goFirst}
            onPrev={goPrev}
            onNext={goNext}
            onLast={goLast}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onToggleMode={toggleMode}
            onOpenSearch={() => setSearchOpen(true)}
          />
        </Footer>
      </section>
    </div>
  );
}
