import { useCallback, useMemo } from 'react';
import { brain } from '../api/brain';
import { POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData } from '../utils/renderItems';
import { ghlFeed, nonqmFeed, riseFeed, townFeed, type FeedLine } from './rhinoLock';

export function useRhinoFeeds(brainOnline: boolean): FeedLine[] {
  const fetchTown = useCallback(() => brain.inboxRadar(), []);
  const fetchGhl = useCallback(() => brain.ghlCrm(), []);
  const fetchMoves = useCallback(() => brain.topMoves(3), []);

  const town = useBrainQuery('rhino-town', fetchTown, { refreshMs: POLL_MODULE_MS });
  const ghl = useBrainQuery('rhino-ghl', fetchGhl, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS,
  });
  const moves = useBrainQuery('rhino-nonqm', fetchMoves, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS * 2,
  });

  return useMemo(() => {
    const townLive = brainOnline && hasLiveData(town.data);
    const ghlLive = brainOnline && hasLiveData(ghl.data);
    const moveLive = brainOnline && hasLiveData(moves.data);
    return [
      townFeed(town.data?.items as unknown[] | undefined, townLive),
      ghlFeed(ghl.data?.leads as unknown[] | undefined, ghl.data?.new_leads, ghlLive),
      riseFeed(undefined, false),
      nonqmFeed(moves.data?.moves as unknown[] | undefined, moveLive),
    ];
  }, [brainOnline, town.data, ghl.data, moves.data]);
}
