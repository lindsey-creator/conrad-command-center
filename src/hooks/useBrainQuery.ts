import { useCallback, useEffect, useRef, useState } from 'react';

const REFRESH_MS = 15 * 60 * 1000;

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  stale: boolean;
  error: string | null;
  lastFetched: Date | null;
}

export function useBrainQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  refreshMs = REFRESH_MS,
): QueryState<T> & { refresh: () => void } {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    stale: false,
    error: null,
    lastFetched: null,
  });
  const dataRef = useRef<T | null>(null);

  const load = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setState((s) => ({ ...s, loading: !s.data, error: null }));
      }
      try {
        const data = await fetcher();
        dataRef.current = data;
        setState({
          data,
          loading: false,
          stale: false,
          error: null,
          lastFetched: new Date(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Fetch failed';
        setState((s) => ({
          ...s,
          loading: false,
          stale: !!dataRef.current,
          error: message,
          data: dataRef.current,
        }));
      }
    },
    [fetcher],
  );

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(true), refreshMs);
    return () => clearInterval(interval);
  }, [key, load, refreshMs]);

  return { ...state, refresh: () => void load() };
}
