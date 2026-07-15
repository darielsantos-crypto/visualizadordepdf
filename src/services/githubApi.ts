import { GITHUB_API_BASE, GITHUB_OWNER, GITHUB_REPO, PDF_FOLDER } from '../utils/constants';
import { getCached, setCached, clearCached } from '../utils/cache';
import { cleanName } from '../utils/helpers';
import { LIST_CACHE_KEY, LIST_CACHE_TTL } from '../utils/constants';
import type { GitHubContent, PDFDoc } from '../types';

export async function fetchPdfList(force = false): Promise<PDFDoc[]> {
  if (!force) {
    const cached = getCached<PDFDoc[]>(LIST_CACHE_KEY);
    if (cached) return cached;
  }

  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PDF_FOLDER}`;
  let resp: Response;
  try {
    resp = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  } catch {
    throw new Error('Não foi possível conectar à GitHub API. Verifique sua conexão.');
  }

  if (!resp.ok) {
    if (resp.status === 404) {
      throw new Error(`Pasta "/${PDF_FOLDER}" não encontrada no repositório ${GITHUB_OWNER}/${GITHUB_REPO}.`);
    }
    if (resp.status === 403) {
      throw new Error('Limite de requisições da GitHub API atingido. Tente novamente em alguns minutos.');
    }
    throw new Error(`Erro ao listar PDFs (${resp.status}).`);
  }

  const data = (await resp.json()) as GitHubContent[];
  if (!Array.isArray(data)) {
    throw new Error('Resposta inesperada da GitHub API.');
  }

  const docs = data
    .filter((item) => item.type === 'file' && /\.pdf$/i.test(item.name))
    .map((item): PDFDoc => ({
      id: item.sha,
      name: item.name,
      cleanName: cleanName(item.name),
      path: item.path,
      downloadUrl: item.download_url ?? `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/HEAD/${item.path}`,
      size: item.size,
      htmlUrl: item.html_url,
    }))
    .sort((a, b) => a.cleanName.localeCompare(b.cleanName, 'pt-BR'));

  setCached(LIST_CACHE_KEY, docs, LIST_CACHE_TTL);
  return docs;
}

export function invalidateListCache(): void {
  clearCached(LIST_CACHE_KEY);
}
