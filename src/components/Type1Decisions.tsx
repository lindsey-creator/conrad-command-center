import { useCallback, useMemo } from 'react';
import { brain, type MoneyMove, type TeamPulseGap, type WatchlistItem } from '../api/brain';
import { POLL_FAST_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel } from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
import './type1-decisions.css';

export type Type1Kind = 'money_now' | 'leaking' | 'efficiency';

export interface Type1Slot {
  kind: Type1Kind;
  title: string;
  detail: string;
  action?: string;
  status: 'live' | 'connect_source' | 'clear' | 'offline';
  sources: string[];
}

const SLOT_META: Record<
  Type1Kind,
  { kicker: string; empty: string; sources: string[] }
> = {
  money_now: {
    kicker: 'MONEY NOW',
    empty: 'No live capital move — Brain will fill this when deals or GHL move.',
    sources: ['clickup', 'ghl'],
  },
  leaking: {
    kicker: 'LEAKING',
    empty: 'No live leak — watch list is empty or not wired.',
    sources: ['clickup', 'brain_scan'],
  },
  efficiency: {
    kicker: 'EFFICIENCY',
    empty: 'No live team gap — pulse is clear or ClickUp is offline.',
    sources: ['clickup'],
  },
};

function moneySlot(moves: MoneyMove[], sources: string[], live: boolean): Type1Slot {
  const move = moves[0];
  if (live && move) {
    return {
      kind: 'money_now',
      title: move.title,
      detail: move.why,
      action: move.recommended_action,
      status: 'live',
      sources,
    };
  }
  return {
    kind: 'money_now',
    title: live ? 'Clear' : 'Connect source',
    detail: SLOT_META.money_now.empty,
    status: live ? 'clear' : 'connect_source',
    sources: sources.length ? sources : SLOT_META.money_now.sources,
  };
}

function leakingSlot(items: WatchlistItem[], sources: string[], live: boolean): Type1Slot {
  const item = items[0];
  if (live && item) {
    return {
      kind: 'leaking',
      title: item.title ?? itemLabel(item),
      detail: item.detail ?? 'On today’s watch list — act before it compounds.',
      action: 'Review watch list',
      status: 'live',
      sources,
    };
  }
  return {
    kind: 'leaking',
    title: live ? 'Clear' : 'Connect source',
    detail: SLOT_META.leaking.empty,
    status: live ? 'clear' : 'connect_source',
    sources: sources.length ? sources : SLOT_META.leaking.sources,
  };
}

function efficiencySlot(
  gaps: TeamPulseGap[],
  overdueCount: number,
  sources: string[],
  live: boolean,
): Type1Slot {
  const gap = gaps[0];
  if (live && gap) {
    return {
      kind: 'efficiency',
      title: gap.person,
      detail: `${gap.committed} → ${gap.actual}`,
      action: gap.suggested_move,
      status: 'live',
      sources,
    };
  }
  if (live && overdueCount > 0) {
    return {
      kind: 'efficiency',
      title: `${overdueCount} overdue`,
      detail: 'Team pulse has late work — close the oldest first.',
      action: 'Open Team Pulse',
      status: 'live',
      sources,
    };
  }
  return {
    kind: 'efficiency',
    title: live ? 'Clear' : 'Connect source',
    detail: SLOT_META.efficiency.empty,
    status: live ? 'clear' : 'connect_source',
    sources: sources.length ? sources : SLOT_META.efficiency.sources,
  };
}

interface Type1DecisionsProps {
  brainOnline?: boolean;
  onConnect?: (source: string) => void;
}

export function Type1Decisions({ brainOnline = false, onConnect }: Type1DecisionsProps) {
  const fetchWatch = useCallback(() => brain.watchlist(), []);
  const fetchMoves = useCallback(() => brain.topMoves(3), []);
  const fetchPulse = useCallback(() => brain.teamPulse(), []);

  const watchlist = useBrainQuery('type1-watch', fetchWatch, {
    refreshMs: POLL_FAST_MS,
    staggerMs: 0,
  });
  const topMoves = useBrainQuery('type1-moves', fetchMoves, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS,
  });
  const teamPulse = useBrainQuery('type1-pulse', fetchPulse, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS * 2,
  });

  const loading =
    !watchlist.data &&
    !topMoves.data &&
    !teamPulse.data &&
    (watchlist.loading || topMoves.loading || teamPulse.loading);

  const slots = useMemo<Type1Slot[]>(() => {
    if (!brainOnline) {
      return (['money_now', 'leaking', 'efficiency'] as Type1Kind[]).map((kind) => ({
        kind,
        title: 'Brain offline',
        detail: 'Link Stack — JARVIS will not invent Type-1s.',
        status: 'offline',
        sources: SLOT_META[kind].sources,
      }));
    }

    const movesLive = !!(topMoves.data && hasLiveData(topMoves.data));
    const watchLive = !!(watchlist.data && hasLiveData(watchlist.data));
    const pulseLive = !!(teamPulse.data && hasLiveData(teamPulse.data));

    return [
      moneySlot(
        movesLive ? topMoves.data?.moves ?? [] : [],
        topMoves.data?.sources ?? SLOT_META.money_now.sources,
        movesLive,
      ),
      leakingSlot(
        watchLive ? ((watchlist.data?.items ?? []) as WatchlistItem[]) : [],
        watchlist.data?.sources ?? SLOT_META.leaking.sources,
        watchLive,
      ),
      efficiencySlot(
        pulseLive ? teamPulse.data?.gaps ?? [] : [],
        pulseLive ? teamPulse.data?.overdue.length ?? 0 : 0,
        teamPulse.data?.sources ?? SLOT_META.efficiency.sources,
        pulseLive,
      ),
    ];
  }, [brainOnline, watchlist.data, topMoves.data, teamPulse.data]);

  return (
    <section className="type1 hud-corners jarvis-glass" aria-label="Type-1 decisions">
      <div className="type1__arc" aria-hidden="true" />
      <div className="type1__head">
        <div>
          <span className="type1__kicker">Type-1 surface · max 3</span>
          <h2 className="type1__title">MONEY NOW · LEAKING · EFFICIENCY</h2>
        </div>
        <span
          className={`type1__brain-pill${brainOnline ? ' type1__brain-pill--live' : ''}`}
          title={brainOnline ? 'Brain reachable' : 'Brain offline'}
        >
          {brainOnline ? 'JARVIS linked' : 'Brain offline'}
        </span>
      </div>

      {loading && <p className="type1__empty">Scanning Brain for today’s Type-1 calls…</p>}

      <ul className="type1__grid">
        {slots.map((slot) => (
          <li key={slot.kind} className={`type1__card type1__card--${slot.kind} type1__card--${slot.status}`}>
            <span className="type1__cat">{SLOT_META[slot.kind].kicker}</span>
            <h3 className="type1__card-title">{slot.title}</h3>
            <p className="type1__detail">{slot.detail}</p>
            {slot.action && slot.status === 'live' && (
              <p className="type1__action">{slot.action}</p>
            )}
            {slot.status === 'connect_source' && (
              <ConnectSource sources={slot.sources} onConnect={onConnect} />
            )}
            {slot.status === 'offline' && onConnect && (
              <button
                type="button"
                className="type1__connect-btn"
                onClick={() => onConnect(slot.sources[0])}
              >
                Connect source
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
