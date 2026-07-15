import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
  html_url: string;
}

export interface PDFDoc {
  id: string;
  name: string;
  cleanName: string;
  path: string;
  downloadUrl: string;
  size: number;
  htmlUrl: string;
}

export type ViewMode = 'book' | 'document';

export interface SearchMatch {
  pageIndex: number;
  snippet: string;
  matchIndex: number;
}

export interface SearchResults {
  query: string;
  matches: SearchMatch[];
  totalPages: number;
}

export interface PageRenderResult {
  canvas: HTMLCanvasElement;
  textLayerDiv: HTMLDivElement;
  width: number;
  height: number;
}

export interface PDFState {
  doc: PDFDocumentProxy | null;
  numPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

export interface UserPreferences {
  lastDocId: string | null;
  viewMode: ViewMode;
  zoom: number;
  pageByDoc: Record<string, number>;
}
