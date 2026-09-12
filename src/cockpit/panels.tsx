import { useCallback, useMemo } from 'react';
import { brain, type MoneyMove, type TeamPulseGap, type WatchlistItem } from '../api/brain';
import { POLL_FAST_MS, POLL_MODULE_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel, itemTime } from '../utils/renderItems';
import { Evidence } from './Evidence';

export interface Type1Target {
  id: string;
  lane: 'MONEY NOW' | 'LEAKING' | 'EFFICIENCY';
  title: string;
  detail: string;
  command: string;
  proven: boolean;
}

interface PanelProps {
  brainOnline: boolean;
  onCommand: (text: string) => void;
  onArm?: (armed: boolean) => void;
  onConnect?: (source: string) => void;
}

export function Type1Targeting({ brainOnline, onCommand, onArm }: PanelProps) {
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

  const targets = useMemo<Type1Target[]>(() => {
    const movesLive = brainOnline && hasLiveData(topMoves.data);
    const watchLive = brainOnline && hasLiveData(watchlist.data);
    const pulseLive = brainOnline && hasLiveData(pulse.data);
    const blindLive = brainOnline && hasLiveData(blinds.data);

    const move = movesLive ? topMoves.data?.moves?.[0] : undefined;
    const watch = watchLive ? (watchlist.data?.items?.[0] as WatchlistItem | undefined) : undefined;
    const gap = pulseLive ? pulse.data?.gaps?.[0] : undefined;
    const overdue = pulseLive ? pulse.data?.overdue?.[0] : undefined;
    const blind = blindLive ? blinds.data?.items?.[0] : undefined;

    const money: Type1Target = move
      ? {
          id: 't-money',
          lane: 'MONEY NOW',
          title: move.title,
          detail: move.recommended_action || move.why,
          command: `Money now: ${move.title}. ${move.recommended_action ?? move.why}`,
          proven: true,
        }
      : {
          id: 't-money',
          lane: 'MONEY NOW',
          title: brainOnline ? 'No capital lock' : 'Brain offline',
          detail: 'Waiting on deals / GHL — never invented.',
          command: 'Money now — what dollar should I move?',
          proven: false,
        };

    const leakSrc = watch ?? overdue;
    const leaking: Type1Target = leakSrc
      ? {
          id: 't-leak',
          lane: 'LEAKING',
          title: 'title' in leakSrc && leakSrc.title ? String(leakSrc.title) : `${(leakSrc as { person?: string }).person ?? 'Leak'}`,
          detail:
            'detail' in leakSrc && leakSrc.detail
              ? String(leakSrc.detail)
              : `${(leakSrc as { task?: string }).task ?? 'Watch item'} ${(leakSrc as { days_late?: number }).days_late != null ? `· ${(leakSrc as { days_late?: number }).days_late}d` : ''}`,
          command: `Leaking: ${itemLabel(leakSrc)}. Close it.`,
          proven: true,
        }
      : {
          id: 't-leak',
          lane: 'LEAKING',
          title: brainOnline ? 'No leak flagged' : 'Brain offline',
          detail: 'Watch list and pulse are quiet or unconnected.',
          command: 'What is leaking today?',
          proven: false,
        };

    const efficiency: Type1Target = gap
      ? {
          id: 't-eff',
          lane: 'EFFICIENCY',
          title: gap.person,
          detail: gap.suggested_move || `${gap.committed} → ${gap.actual}`,
          command: `Efficiency: ${gap.person}. ${gap.suggested_move}`,
          proven: true,
        }
      : blind
        ? {
            id: 't-eff',
            lane: 'EFFICIENCY',
            title: itemLabel(blind),
            detail: 'Blind spot across units.',
            command: `Efficiency blind spot: ${itemLabel(blind)}`,
            proven: true,
          }
        : {
            id: 't-eff',
            lane: 'EFFICIENCY',
            title: brainOnline ? 'No efficiency call' : 'Brain offline',
            detail: 'Gaps stay dark until Fieldy or ClickUp are live.',
            command: 'Where is efficiency dying?',
            proven: false,
          };

    return [money, leaking, efficiency].slice(0, 3);
  }, [brainOnline, topMoves.data, watchlist.data, pulse.data, blinds.data]);

  return (
    <section className="panel type1-tgt" aria-label="Type-1 targeting">
      <div className="panel__head">
        <span className="panel-kicker">Type-1 Targeting</span>
        <span className="panel__count">MAX 3</span>
      </div>
      <ol className="type1-tgt__list">
        {targets.map((t, i) => (
          <li key={t.id}>
            <button
              type="button"
              className={`type1-tgt__row type1-tgt__row--${t.lane === 'LEAKING' ? 'leak' : t.lane === 'MONEY NOW' ? 'money' : 'eff'}`}
              onClick={() => {
                onArm?.(true);
                onCommand(t.command);
                window.setTimeout(() => onArm?.(false), 2400);
              }}
            >
              <span className="type1-tgt__idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="type1-tgt__body">
                <span className="type1-tgt__lane">
                  {t.lane}
                  <Evidence proven={t.proven} />
                </span>
                <span className="type1-tgt__title">{t.title}</span>
                <span className="type1-tgt__detail">{t.detail}</span>
              </span>
              <span className="type1-tgt__go">LOCK</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MoneyNowPanel({ brainOnline, onCommand }: PanelProps) {
  const fetchMoves = useCallback(() => brain.topMoves(3), []);
  const { data } = useBrainQuery('money-panel', fetchMoves, { refreshMs: POLL_FAST_MS });
  const proven = brainOnline && hasLiveData(data);
  const move: MoneyMove | undefined = proven ? data?.moves?.[0] : undefined;
  const dollars = move?.dollars != null && move.dollars !== '' ? String(move.dollars) : proven ? 'CLEAR' : '—';

  return (
    <section className="panel money-now" aria-label="Money now">
      <div className="panel__head">
        <span className="panel-kicker">Money Now</span>
        <Evidence proven={Boolean(proven && move)} />
      </div>
      <p className="money-now__figure">{dollars}</p>
      <p className="money-now__title">{move?.title ?? (brainOnline ? 'No live dollar lock' : 'Brain offline')}</p>
      <p className="money-now__why">{move?.why ?? 'Engine narrates only. Connect deals or GHL to prove the next move.'}</p>
      <button
        type="button"
        className="panel-run"
        onClick={() => onCommand(move ? `Money now: ${move.title}. ${move.recommended_action ?? move.why}` : 'Money now — what dollar should I move?')}
      >
        Run
      </button>
    </section>
  );
}

export function LeakingPanel({ brainOnline, onCommand }: PanelProps) {
  const fetchWatch = useCallback(() => brain.watchlist(), []);
  const fetchPulse = useCallback(() => brain.teamPulse(), []);
  const watch = useBrainQuery('leak-watch', fetchWatch, { refreshMs: POLL_FAST_MS });
  const pulse = useBrainQuery('leak-pulse', fetchPulse, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS,
  });

  const watchLive = brainOnline && hasLiveData(watch.data);
  const pulseLive = brainOnline && hasLiveData(pulse.data);
  const items = watchLive ? (watch.data?.items ?? []) : [];
  const overdue = pulseLive ? pulse.data?.overdue ?? [] : [];
  const gaps = pulseLive ? (pulse.data?.gaps ?? []) as TeamPulseGap[] : [];
  const count = items.length + overdue.length;
  const first = items[0] ?? overdue[0] ?? gaps[0];
  const proven = Boolean(watchLive || pulseLive);
  const critical = overdue.some((o) => o.days_late >= 7);

  return (
    <section className={`panel leaking${critical ? ' leaking--crit' : count > 0 ? ' leaking--warn' : ''}`} aria-label="Leaking">
      <div className="panel__head">
        <span className="panel-kicker">Leaking</span>
        <Evidence proven={proven && count > 0} />
      </div>
      <p className="leaking__figure">{proven ? count : '—'}</p>
      <p className="leaking__title">
        {first ? itemLabel(first) : proven ? 'No leaks on the glass' : 'Unproven — connect watch / team'}
      </p>
      <p className="leaking__why">
        {overdue[0]
          ? `${overdue[0].person} · ${overdue[0].days_late}d late`
          : 'Accountability radar. Amber watch. Red if it will bite today.'}
      </p>
      <button
        type="button"
        className="panel-run"
        onClick={() => onCommand(first ? `Leaking: ${itemLabel(first)}. Close it.` : 'What is leaking today?')}
      >
        Plug
      </button>
    </section>
  );
}

export function DayOrbit({ brainOnline, onCommand }: PanelProps) {
  const fetchBrief = useCallback(() => brain.dailyBrief(), []);
  const fetchWeek = useCallback(() => brain.weekAhead(), []);
  const brief = useBrainQuery('orbit-brief', fetchBrief, { refreshMs: POLL_MODULE_MS });
  const week = useBrainQuery('orbit-week', fetchWeek, {
    refreshMs: POLL_MODULE_MS,
    staggerMs: POLL_STAGGER_MS,
  });

  const briefLive = brainOnline && hasLiveData(brief.data?.today_schedule);
  const weekLive = brainOnline && hasLiveData(week.data);
  const items = [
    ...((briefLive ? brief.data?.today_schedule?.items : []) ?? []),
    ...((weekLive ? week.data?.items : []) ?? []),
  ].slice(0, 6);
  const proven = items.length > 0;

  return (
    <section className="panel day-orbit" aria-label="Day orbit">
      <div className="panel__head">
        <span className="panel-kicker">Day Orbit</span>
        <Evidence proven={proven} />
      </div>
      <div className="day-orbit__track" aria-hidden={!items.length}>
        <span className="day-orbit__line" />
        {items.length === 0 ? (
          <p className="day-orbit__empty">
            {brainOnline
              ? 'Orbit is dark until Calendar is connected. No invented meetings.'
              : 'Brain offline — day orbit unproven.'}
          </p>
        ) : (
          <ol className="day-orbit__nodes">
            {items.map((item, i) => (
              <li key={`${itemTime(item) ?? i}-${itemLabel(item)}`} className="day-orbit__node">
                <span className="day-orbit__time">{itemTime(item) ?? '—'}</span>
                <span className="day-orbit__dot" />
                <span className="day-orbit__label">{itemLabel(item)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <button
        type="button"
        className="panel-run panel-run--inline"
        onClick={() => onCommand("What's on my calendar and what should I protect?")}
      >
        Protect
      </button>
    </section>
  );
}
