import { useCallback, useMemo } from 'react';
import { brain, type MoneyMove, type TeamPulseGap, type WatchlistItem } from '../api/brain';
import { POLL_FAST_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel } from '../utils/renderItems';
import { ConnectSource } from './ConnectSource';
import './type1-decisions.css';

export type Type1Category = 'money_now' | 'leaking' | 'efficiency';

export interface Type1Card {
  id: string;
  category: Type1Category;
  title: string;
  detail: string;
  action?: string;
  command?: string;
  live: boolean;
  sources: string[];
}

const CATEGORY_LABEL: Record<Type1Category, string> = {
  money_now: 'MONEY NOW',
  leaking: 'LEAKING',
  efficiency: 'EFFICIENCY',
};

const SLOTS: Type1Category[] = ['money_now', 'leaking', 'efficiency']; // queue cap 3

function firstMove(moves: MoneyMove[]): Type1Card | null {
  const move = moves[0];
  if (!move) return null;
  const dollars = move.dollars != null && move.dollars !== '' ? ` · ${move.dollars}` : '';
  return {
    id: 'money_now',
    category: 'money_now',
    title: move.title,
    detail: `${move.why}${dollars}`,
    action: move.recommended_action,
    command: `Money now: ${move.title}. ${move.recommended_action ?? move.why}`,
    live: true,
    sources: [],
  };
}

function firstLeak(watchItems: WatchlistItem[], overdue: { person: string; task: string; days_late: number }[]): Type1Card | null {
  if (watchItems[0]) {
    const item = watchItems[0];
    const title = item.title ?? itemLabel(item);
    return {
      id: 'leaking',
      category: 'leaking',
      title,
      detail: item.detail ?? 'On the watch list — plug this before it compounds.',
      action: 'Close the leak',
      command: `Leaking: ${title}. Close this leak.`,
      live: true,
      sources: [],
    };
  }
  if (overdue[0]) {
    const row = overdue[0];
    return {
      id: 'leaking',
      category: 'leaking',
      title: `${row.person} · ${row.days_late}d late`,
      detail: row.task,
      action: 'Recover the slip',
      command: `Leaking: ${row.person} is ${row.days_late}d late on ${row.task}. Recover it.`,
      live: true,
      sources: [],
    };
  }
  return null;
}

function firstEfficiency(gaps: TeamPulseGap[], blindItems: unknown[]): Type1Card | null {
  if (gaps[0]) {
    const gap = gaps[0];
    return {
      id: 'efficiency',
      category: 'efficiency',
      title: gap.person,
      detail: `${gap.committed} → ${gap.actual}`,
      action: gap.suggested_move,
      command: `Efficiency: ${gap.person}. ${gap.suggested_move}`,
      live: true,
      sources: [],
    };
  }
  if (blindItems[0]) {
    const title = itemLabel(blindItems[0]);
    return {
      id: 'efficiency',
      category: 'efficiency',
      title,
      detail: 'Empire blind spot — visibility gap across units.',
      action: 'Illuminate the gap',
      command: `Efficiency blind spot: ${title}. Illuminate it.`,
      live: true,
      sources: [],
    };
  }
  return null;
}

function standbyCard(category: Type1Category, sources: string[], brainOnline: boolean): Type1Card {
  const copy: Record<Type1Category, { title: string; detail: string }> = {
    money_now: {
      title: brainOnline ? 'No capital move locked' : 'Brain offline',
      detail: brainOnline
        ? 'Connect deals, GHL apply, or ClickUp — JARVIS will narrate the next dollar, never invent it.'
        : 'Link the Brain before MONEY NOW can fire.',
    },
    leaking: {
      title: brainOnline ? 'No leak flagged' : 'Brain offline',
      detail: brainOnline
        ? 'Watch list and team pulse are quiet or unconnected.'
        : 'Link the Brain before LEAKING can fire.',
    },
    efficiency: {
      title: brainOnline ? 'No efficiency call' : 'Brain offline',
      detail: brainOnline
        ? 'Gaps and blind spots stay dark until Fieldy, ClickUp, or calendar are live.'
        : 'Link the Brain before EFFICIENCY can fire.',
    },
  };
  return {
    id: category,
    category,
    title: copy[category].title,
    detail: copy[category].detail,
    live: false,
    sources,
  };
}

interface Type1DecisionsProps {
  brainOnline?: boolean;
  onConnect?: (source: string) => void;
  onCommand?: (text: string) => void;
}

export function Type1Decisions({
  brainOnline = false,
  onConnect,
  onCommand,
}: Type1DecisionsProps) {
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

  const cards = useMemo(() => {
    const watchLive = brainOnline && watchlist.data && hasLiveData(watchlist.data);
    const movesLive = brainOnline && topMoves.data && hasLiveData(topMoves.data);
    const pulseLive = brainOnline && teamPulse.data && hasLiveData(teamPulse.data);
    const blindLive = brainOnline && blindspots.data && hasLiveData(blindspots.data);

    const watchItems = watchLive ? ((watchlist.data?.items ?? []) as WatchlistItem[]) : [];
    const moves = movesLive ? topMoves.data?.moves ?? [] : [];
    const gaps = pulseLive ? teamPulse.data?.gaps ?? [] : [];
    const overdue = pulseLive ? teamPulse.data?.overdue ?? [] : [];
    const blindItems = blindLive ? blindspots.data?.items ?? [] : [];

    const live: Record<Type1Category, Type1Card | null> = {
      money_now: firstMove(moves),
      leaking: firstLeak(watchItems, overdue),
      efficiency: firstEfficiency(gaps, blindItems),
    };

    return SLOTS.map((slot) => {
      if (live[slot]) return live[slot] as Type1Card;
      const sources =
        slot === 'money_now'
          ? ['ghl', 'clickup']
          : slot === 'leaking'
            ? ['clickup', 'fieldy']
            : ['clickup', 'fieldy', 'google_calendar'];
      return standbyCard(slot, sources, brainOnline);
    });
  }, [brainOnline, watchlist.data, topMoves.data, teamPulse.data, blindspots.data]);

  return (
    <section className="type1 hud-corners jarvis-glass" aria-label="Type-1 decisions">
      <div className="type1__head">
        <div>
          <span className="type1__kicker">Type-1 only</span>
          <h2 className="type1__title">MONEY NOW · LEAKING · EFFICIENCY</h2>
        </div>
        <span
          className={`type1__brain-pill${brainOnline ? ' type1__brain-pill--live' : ''}`}
          title={brainOnline ? 'Brain reachable' : 'Brain offline'}
        >
          {brainOnline ? 'JARVIS linked' : 'Brain offline'}
        </span>
      </div>

      <ul className="type1__grid">
        {cards.map((card) => (
          <li key={card.id} className={`type1__card type1__card--${card.category}`}>
            <span className="type1__cat">{CATEGORY_LABEL[card.category]}</span>
            <h3 className="type1__card-title">{card.title}</h3>
            <p className="type1__detail">{card.detail}</p>
            {card.action && <p className="type1__action">{card.action}</p>}
            {!card.live && <span className="type1__standby">Standby · no invented numbers</span>}
            {card.live && onCommand && card.command && (
              <button
                type="button"
                className="type1__run"
                onClick={() => onCommand(card.command ?? card.title)}
              >
                Run through glass
              </button>
            )}
            {!card.live && card.sources.length > 0 && (
              <ConnectSource sources={card.sources} onConnect={onConnect} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
