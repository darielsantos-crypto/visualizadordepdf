import {
  GITHUB_API_BASE,
  GITHUB_BRANCH,
  GITHUB_OWNER,
  GITHUB_REPO,
  LIST_CACHE_KEY,
  LIST_CACHE_TTL,
  PDF_FOLDER,
} from '../utils/constants';
import { getCached, setCached, clearCached } from '../utils/cache';
import { cleanName } from '../utils/helpers';
import type { GitHubContent, PDFDoc } from '../types';

const encodePath = (path: string): string =>
  path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const encodedFolder = encodePath(PDF_FOLDER);
const encodedBranch = encodeURIComponent(GITHUB_BRANCH);

export async function fetchPdfList(force = false): Promise<PDFDoc[]> {
  if (!force) {
    const cached = getCached<PDFDoc[]>(LIST_CACHE_KEY);
    if (cached) return cached;
  }

  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${encodedFolder}?ref=${encodedBranch}`;
  let resp: Response;

  try {
    resp = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  } catch {
    throw new Error('Não foi possível conectar à GitHub API. Verifique sua conexão.');
  }

  if (!resp.ok) {
    if (resp.status === 404) {
      throw new Error(
        `A pasta "/${PDF_FOLDER}" não foi encontrada na branch "${GITHUB_BRANCH}" do repositório ${GITHUB_OWNER}/${GITHUB_REPO}.`,
      );
    }
    if (resp.status === 403) {
      throw new Error(
        'O limite temporário de requisições da GitHub API foi atingido. Aguarde alguns minutos e atualize a biblioteca.',
      );
    }
    throw new Error(`Erro ao listar PDFs no GitHub (${resp.status}).`);
  }

  const data = (await resp.json()) as GitHubContent[] | GitHubContent;
  if (!Array.isArray(data)) {
    throw new Error(`O caminho "/${PDF_FOLDER}" existe, mas não é uma pasta.`);
  }

  const docs = data
    .filter((item) => item.type === 'file' && /\.pdf$/i.test(item.name))
    .map((item): PDFDoc => {
      const rawPath = encodePath(item.path);
      const fallbackUrl = `https://raw.githubusercontent.com/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/${encodedBranch}/${rawPath}`;

      return {
        id: item.sha,
        name: item.name,
        cleanName: cleanName(item.name),
        path: item.path,
        downloadUrl: item.download_url ?? fallbackUrl,
        size: item.size,
        htmlUrl: item.html_url,
      };
    })
    .sort((a, b) => a.cleanName.localeCompare(b.cleanName, 'pt-BR'));

  setCached(LIST_CACHE_KEY, docs, LIST_CACHE_TTL);
  return docs;
}

export function invalidateListCache(): void {
  clearCached(LIST_CACHE_KEY);
}
