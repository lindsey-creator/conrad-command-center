import { useCallback, useEffect, useRef, useState } from 'react';
import { POLL_MODULE_MS } from './brainPoll';
import { touchBrainLive } from './brainLive';

export interface BrainQueryOptions {
  refreshMs?: number;
  /** Delay first fetch to stagger parallel module loads. */
  staggerMs?: number;
  refetchOnFocus?: boolean;
}

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  stale: boolean;
  error: string | null;
  lastFetched: Date | null;
  offline: boolean;
}

function resolveOptions(
  options: number | BrainQueryOptions | undefined,
): Required<BrainQueryOptions> {
  if (typeof options === 'number') {
    return { refreshMs: options, staggerMs: 0, refetchOnFocus: true };
  }
  return {
    refreshMs: options?.refreshMs ?? POLL_MODULE_MS,
    staggerMs: options?.staggerMs ?? 0,
    refetchOnFocus: options?.refetchOnFocus ?? true,
  };
}

export function useBrainQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: number | BrainQueryOptions,
): QueryState<T> & { refresh: () => void } {
  const { refreshMs, staggerMs, refetchOnFocus } = resolveOptions(options);
  const [offline, setOffline] = useState(
    () => typeof navigator !== 'undefined' && !navigator.onLine,
  );
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    stale: false,
    error: null,
    lastFetched: null,
    offline: false,
  });
  const dataRef = useRef<T | null>(null);

  const load = useCallback(
    async (isBackground = false) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setOffline(true);
        setState((s) => ({ ...s, offline: true, loading: false }));
        return;
      }
      setOffline(false);

      if (!isBackground) {
        setState((s) => ({
          ...s,
          loading: !s.data,
          error: null,
          offline: false,
        }));
      }
      try {
        const data = await fetcher();
        dataRef.current = data;
        touchBrainLive();
        setState({
          data,
          loading: false,
          stale: false,
          error: null,
          lastFetched: new Date(),
          offline: false,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Fetch failed';
        setState((s) => ({
          ...s,
          loading: false,
          stale: !!dataRef.current,
          error: message,
          data: dataRef.current,
          offline: false,
        }));
      }
    },
    [fetcher],
  );

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const kickoff = () => {
      void load().finally(() => {
        if (!cancelled) {
          interval = setInterval(() => void load(true), refreshMs);
        }
      });
    };

    const staggerTimer = setTimeout(kickoff, staggerMs);

    return () => {
      cancelled = true;
      clearTimeout(staggerTimer);
      if (interval) clearInterval(interval);
    };
  }, [key, load, refreshMs, staggerMs]);

  useEffect(() => {
    if (!refetchOnFocus) return;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [load, refetchOnFocus]);

  useEffect(() => {
    const onOnline = () => {
      setOffline(false);
      void load(true);
    };
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [load]);

  return { ...state, offline, refresh: () => void load() };
}
