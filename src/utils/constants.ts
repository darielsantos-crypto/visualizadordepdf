export const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER ?? 'noa-guento-mais';
export const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO ?? 'noa-guento-mais';
export const PDF_FOLDER = import.meta.env.VITE_PDF_FOLDER ?? 'pdf';

export const GITHUB_API_BASE = 'https://api.github.com';

export const COLORS = {
  primary: '#004883',
  secondary: '#EF3340',
  stage: '#555',
  textLight: '#FFFFFF',
  textDark: '#173044',
  pageShadow: '0 18px 45px rgba(0,0,0,0.5)',
} as const;

export const LIST_CACHE_KEY = 'pdf-reader:list-cache';
export const LIST_CACHE_TTL = 10 * 60 * 1000;

export const PREFS_KEY = 'pdf-reader:preferences';

import type { UserPreferences } from '../types';

export const DEFAULT_PREFS: UserPreferences = {
  lastDocId: null,
  viewMode: 'book',
  zoom: 1,
  pageByDoc: {},
};

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.1;

export const PAGE_RENDER_SCALE = 1.5;
export const RENDER_CACHE_LIMIT = 12;
