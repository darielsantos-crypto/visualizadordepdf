import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      return { ...initial, ...(JSON.parse(raw) as object) } as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  const update = useCallback((patch: Partial<T>) => {
    setValue((prev) => ({ ...prev, ...patch }) as T);
  }, []);

  return [value, update, setValue] as const;
}
