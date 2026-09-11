import { useCallback, useMemo } from 'react';
import { brain, type MoneyMove, type TeamPulseGap, type WatchlistItem } from '../api/brain';
import { POLL_FAST_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel } from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
import './type1-decisions.css';

export type Type1Category = 'capital' | 'judgment' | 'relationships' | 'authority';

export interface Type1Card {
  id: string;
  category: Type1Category;
  title: string;
  detail: string;
  action?: string;
}

const CATEGORY_LABEL: Record<Type1Category, string> = {
  capital: 'Capital',
  judgment: 'Judgment',
  relationships: 'Relationships',
  authority: 'Authority',
};

function watchToCard(item: WatchlistItem, index: number): Type1Card {
  return {
    id: `watch-${index}`,
    category: 'judgment',
    title: item.title ?? itemLabel(item),
    detail: item.detail ?? 'On today’s watch list — act before it compounds.',
    action: 'Review in Watch List',
  };
}

function moveToCard(move: MoneyMove, index: number): Type1Card {
  return {
    id: `move-${index}`,
    category: 'capital',
    title: move.title,
    detail: move.why,
    action: move.recommended_action,
  };
}

function gapToCard(gap: TeamPulseGap, index: number): Type1Card {
  return {
    id: `gap-${index}`,
    category: 'relationships',
    title: gap.person,
    detail: `${gap.committed} → ${gap.actual}`,
    action: gap.suggested_move,
  };
}

function blindspotToCard(item: unknown, index: number): Type1Card {
  return {
    id: `blind-${index}`,
    category: 'authority',
    title: itemLabel(item),
    detail: 'Empire blind spot — visibility gap across units.',
    action: 'See Blind Spots module',
  };
}

function buildType1Cards(
  watchItems: WatchlistItem[],
  moves: MoneyMove[],
  gaps: TeamPulseGap[],
  blindItems: unknown[],
): Type1Card[] {
  const out: Type1Card[] = [];
  for (let i = 0; i < Math.min(1, watchItems.length); i++) {
    out.push(watchToCard(watchItems[i], i));
  }
  for (let i = 0; i < Math.min(1, moves.length); i++) {
    out.push(moveToCard(moves[i], i));
  }
  for (let i = 0; i < Math.min(1, gaps.length); i++) {
    out.push(gapToCard(gaps[i], i));
  }
  if (out.length < 3) {
    for (let i = 0; i < blindItems.length && out.length < 3; i++) {
      out.push(blindspotToCard(blindItems[i], i));
    }
  }
  if (out.length < 3) {
    for (let i = out.filter((c) => c.category === 'judgment').length; i < watchItems.length && out.length < 3; i++) {
      out.push(watchToCard(watchItems[i], i));
    }
  }
  if (out.length < 3) {
    for (let i = 1; i < moves.length && out.length < 3; i++) {
      out.push(moveToCard(moves[i], i));
    }
  }
  return out.slice(0, 3);
}

interface Type1DecisionsProps {
  brainOnline?: boolean;
  onConnect?: (source: string) => void;
}

function collectOfflineSources(
  payloads: Array<{ status?: string; sources?: string[] } | null | undefined>,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const payload of payloads) {
    if (!payload || payload.status !== 'connect_source') continue;
    for (const source of payload.sources ?? []) {
      if (!seen.has(source)) {
        seen.add(source);
        out.push(source);
      }
    }
  }
  return out;
}

export function Type1Decisions({ brainOnline = false, onConnect }: Type1DecisionsProps) {
  const fetchWatch = useCallback(() => brain.watchlist(), []);
  const fetchMoves = useCallback(() => brain.topMoves(3), []);
  const fetchPulse = useCallback(() => brain.teamPulse(), []);
  const fetchBlind = useCallback(() => brain.blindspots(), []);

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
  const blindspots = useBrainQuery('type1-blind', fetchBlind, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS * 3,
  });

  const loading =
    !watchlist.data && !topMoves.data && !teamPulse.data && !blindspots.data &&
    (watchlist.loading || topMoves.loading);

  const offlineSources = useMemo(
    () =>
      collectOfflineSources([
        watchlist.data,
        topMoves.data,
        teamPulse.data,
        blindspots.data,
      ]),
    [watchlist.data, topMoves.data, teamPulse.data, blindspots.data],
  );

  const cards = useMemo(() => {
    if (!brainOnline) return [];

    const watchLive = watchlist.data && hasLiveData(watchlist.data);
    const movesLive = topMoves.data && hasLiveData(topMoves.data);
    const pulseLive = teamPulse.data && hasLiveData(teamPulse.data);
    const blindLive = blindspots.data && hasLiveData(blindspots.data);

    const watchItems = watchLive
      ? (watchlist.data?.items ?? []) as WatchlistItem[]
      : [];
    const moves = movesLive ? topMoves.data?.moves ?? [] : [];
    const gaps = pulseLive ? teamPulse.data?.gaps ?? [] : [];
    const blindItems = blindLive ? blindspots.data?.items ?? [] : [];

    return buildType1Cards(watchItems, moves, gaps, blindItems);
  }, [brainOnline, watchlist.data, topMoves.data, teamPulse.data, blindspots.data]);

  const hasAnySource =
    (watchlist.data && hasLiveData(watchlist.data)) ||
    (topMoves.data && hasLiveData(topMoves.data)) ||
    (teamPulse.data && hasLiveData(teamPulse.data)) ||
    (blindspots.data && hasLiveData(blindspots.data));

  return (
    <section className="type1 hud-corners jarvis-glass" aria-label="Type-1 decisions">
      <div className="type1__head">
        <div>
          <span className="type1__kicker">Type-1 surface</span>
          <h2 className="type1__title">Decisions today</h2>
        </div>
        <span
          className={`type1__brain-pill${brainOnline ? ' type1__brain-pill--live' : ''}`}
          title={brainOnline ? 'Brain reachable' : 'Brain offline'}
        >
          {brainOnline ? 'JARVIS linked' : 'Brain offline'}
        </span>
      </div>

      {loading && (
        <p className="type1__empty">Scanning Brain for today’s Type-1 calls…</p>
      )}

      {!loading && !brainOnline && (
        <div className="type1__connect">
          <p className="type1__empty">Brain offline — no Type-1 cards until Stack is linked.</p>
          {onConnect && (
            <button type="button" className="type1__connect-btn" onClick={() => onConnect('clickup')}>
              Connect source
            </button>
          )}
        </div>
      )}

      {!loading && brainOnline && cards.length === 0 && (
        <div className="type1__connect">
          <p className="type1__empty">
            {hasAnySource
              ? 'No Type-1 calls right now — stack is clear.'
              : 'Connect live sources — JARVIS shows up to three Type-1 cards here, never placeholders.'}
          </p>
          {offlineSources.length > 0 && (
            <ConnectSource sources={offlineSources} onConnect={onConnect} />
          )}
        </div>
      )}

      {cards.length > 0 && (
        <ul className="type1__grid">
          {cards.map((card) => (
            <li key={card.id} className={`type1__card type1__card--${card.category}`}>
              <span className="type1__cat">{CATEGORY_LABEL[card.category]}</span>
              <h3 className="type1__card-title">{card.title}</h3>
              <p className="type1__detail">{card.detail}</p>
              {card.action && <p className="type1__action">{card.action}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
