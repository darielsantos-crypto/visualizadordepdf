import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getPageText } from './pdfRenderer';
import type { SearchMatch } from '../types';
import { snippetAround } from '../utils/helpers';

export async function extractAllText(
  doc: PDFDocumentProxy,
  onProgress?: (current: number, total: number) => void,
): Promise<string[]> {
  const total = doc.numPages;
  const pages: string[] = [];
  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i);
    pages.push(await getPageText(page));
    onProgress?.(i, total);
  }
  return pages;
}

export function searchInPages(
  pagesText: string[],
  query: string,
): SearchMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches: SearchMatch[] = [];
  pagesText.forEach((text, pageIndex) => {
    const lower = text.toLowerCase();
    let idx = 0;
    let matchIndex = 0;
    while ((idx = lower.indexOf(q, idx)) !== -1) {
      matches.push({
        pageIndex,
        snippet: snippetAround(text, idx, idx + q.length),
        matchIndex,
      });
      idx += q.length;
      matchIndex++;
    }
  });
  return matches;
}
