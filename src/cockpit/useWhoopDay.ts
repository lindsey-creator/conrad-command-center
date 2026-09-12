import { useCallback, useMemo } from 'react';
import { brain } from '../api/brain';
import { POLL_MODULE_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { emptyWhoop, parseWhoopFeed, type WhoopDay } from './whoop';

function previewWhoop(): WhoopDay | null {
  if (typeof window === 'undefined') return null;
  if (new URLSearchParams(window.location.search).get('whoop') !== 'low') return null;
  return {
    ...emptyWhoop('connect_source'),
    workGate: 'down',
    verdict: 'WORK LOAD DOWN · GYM STAYS',
  };
}

/** Brain `/health/metrics` first; `/whoop` if the health payload has no WHOOP fields. */
export function useWhoopDay(brainOnline: boolean): WhoopDay {
  const fetchHealth = useCallback(() => brain.healthMetrics(), []);
  const fetchWhoop = useCallback(() => brain.whoopDay(), []);
  const health = useBrainQuery('whoop-health', fetchHealth, { refreshMs: POLL_MODULE_MS });
  const feed = useBrainQuery('whoop-day', fetchWhoop, { refreshMs: POLL_MODULE_MS, staggerMs: 350 });

  return useMemo(() => {
    const preview = previewWhoop();
    const fromHealth = parseWhoopFeed(health.data);
    if (brainOnline && fromHealth.proven) return fromHealth;
    const fromWhoop = parseWhoopFeed(feed.data);
    if (brainOnline && fromWhoop.proven) return fromWhoop;
    if (preview) return preview;
    if (brainOnline && health.data) return fromHealth;
    return emptyWhoop(brainOnline ? 'connect_source' : 'offline');
  }, [brainOnline, health.data, feed.data]);
}
