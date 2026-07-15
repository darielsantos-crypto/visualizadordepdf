interface CacheEntry<T> {
  value: T;
  expires: number;
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expires) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = { value, expires: Date.now() + ttlMs };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // storage full or unavailable; ignore
  }
}

export function clearCached(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

const renderCache = new Map<number, HTMLCanvasElement>();

export function getRenderedPage(pageIndex: number): HTMLCanvasElement | undefined {
  return renderCache.get(pageIndex);
}

export function setRenderedPage(pageIndex: number, canvas: HTMLCanvasElement): void {
  if (renderCache.size > 24) {
    const firstKey = renderCache.keys().next().value;
    if (firstKey !== undefined) renderCache.delete(firstKey);
  }
  renderCache.set(pageIndex, canvas);
}

export function clearRenderCache(): void {
  renderCache.clear();
}
