import { useCallback, useMemo } from 'react';
import { brain, type WatchlistItem } from '../api/brain';
import { POLL_FAST_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel } from '../utils/renderItems';
import { capType1 } from './rhinoLock';

export interface Type1Lock {
  id: string;
  lane: 'MONEY NOW' | 'LEAKING' | 'EFFICIENCY';
  verdict: string;
  command: string;
  proven: boolean;
}

/** Three Type-1 locks only — one-line verdicts, never a table. */
export function useType1Locks(brainOnline: boolean): Type1Lock[] {
  const fetchWatch = useCallback(() => brain.watchlist(), []);
  const fetchMoves = useCallback(() => brain.topMoves(3), []);
  const fetchPulse = useCallback(() => brain.teamPulse(), []);
  const fetchBlind = useCallback(() => brain.blindspots(), []);

  const watchlist = useBrainQuery('hud-watch', fetchWatch, { refreshMs: POLL_FAST_MS });
  const topMoves = useBrainQuery('hud-moves', fetchMoves, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS,
  });
  const pulse = useBrainQuery('hud-pulse', fetchPulse, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS * 2,
  });
  const blinds = useBrainQuery('hud-blind', fetchBlind, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS * 3,
  });

  return useMemo<Type1Lock[]>(() => {
    const movesLive = brainOnline && hasLiveData(topMoves.data);
    const watchLive = brainOnline && hasLiveData(watchlist.data);
    const pulseLive = brainOnline && hasLiveData(pulse.data);
    const blindLive = brainOnline && hasLiveData(blinds.data);

    const move = movesLive ? topMoves.data?.moves?.[0] : undefined;
    const watch = watchLive ? (watchlist.data?.items?.[0] as WatchlistItem | undefined) : undefined;
    const gap = pulseLive ? pulse.data?.gaps?.[0] : undefined;
    const overdue = pulseLive ? pulse.data?.overdue?.[0] : undefined;
    const blind = blindLive ? blinds.data?.items?.[0] : undefined;

    const money: Type1Lock = move
      ? {
          id: '01',
          lane: 'MONEY NOW',
          verdict: [move.title, move.recommended_action || move.why].filter(Boolean).join(' — '),
          command: `Money now: ${move.title}. ${move.recommended_action ?? move.why}`,
          proven: true,
        }
      : {
          id: '01',
          lane: 'MONEY NOW',
          verdict: brainOnline ? 'No capital lock — engine silent.' : 'Brain offline — no invented dollar.',
          command: 'Money now — what dollar should I move?',
          proven: false,
        };

    const leakSrc = watch ?? overdue;
    const leaking: Type1Lock = leakSrc
      ? {
          id: '02',
          lane: 'LEAKING',
          verdict:
            'title' in leakSrc && leakSrc.title
              ? `${leakSrc.title}${leakSrc.detail ? ` — ${leakSrc.detail}` : ''}`
              : `${(leakSrc as { person?: string }).person ?? 'Leak'} — ${(leakSrc as { task?: string }).task ?? 'open'}`,
          command: `Leaking: ${itemLabel(leakSrc)}. Close it.`,
          proven: true,
        }
      : {
          id: '02',
          lane: 'LEAKING',
          verdict: brainOnline ? 'No leak proven on the glass.' : 'Brain offline — no invented leak.',
          command: 'What is leaking today?',
          proven: false,
        };

    const efficiency: Type1Lock = gap
      ? {
          id: '03',
          lane: 'EFFICIENCY',
          verdict: `${gap.person} — ${gap.suggested_move || `${gap.committed} → ${gap.actual}`}`,
          command: `Efficiency: ${gap.person}. ${gap.suggested_move}`,
          proven: true,
        }
      : blind
        ? {
            id: '03',
            lane: 'EFFICIENCY',
            verdict: `${itemLabel(blind)} — blind spot.`,
            command: `Efficiency blind spot: ${itemLabel(blind)}`,
            proven: true,
          }
        : {
            id: '03',
            lane: 'EFFICIENCY',
            verdict: brainOnline ? 'No efficiency call in the Brain.' : 'Brain offline — no invented gap.',
            command: 'Where is efficiency dying?',
            proven: false,
          };

    return capType1([money, leaking, efficiency]);
  }, [brainOnline, topMoves.data, watchlist.data, pulse.data, blinds.data]);
}
