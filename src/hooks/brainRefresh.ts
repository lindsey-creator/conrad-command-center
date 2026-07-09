import { useCallback, useEffect } from 'react';

export const BRAIN_REFRESH_EVENT = 'command-center:refresh-all';

export function dispatchBrainRefresh(): void {
  window.dispatchEvent(new CustomEvent(BRAIN_REFRESH_EVENT));
}

export function useBrainRefreshListener(onRefresh: () => void): void {
  const stable = useCallback(onRefresh, [onRefresh]);

  useEffect(() => {
    const handler = () => stable();
    window.addEventListener(BRAIN_REFRESH_EVENT, handler);
    return () => window.removeEventListener(BRAIN_REFRESH_EVENT, handler);
  }, [stable]);
}
