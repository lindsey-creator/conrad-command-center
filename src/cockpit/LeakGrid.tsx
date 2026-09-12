import { useCallback, useMemo } from 'react';
import { brain, type WatchlistItem } from '../api/brain';
import { POLL_FAST_MS, POLL_STAGGER_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel } from '../utils/renderItems';
import { HOLD } from './readyAgent';

const CELLS = 16;

interface LeakGridProps {
  brainOnline: boolean;
  onAsk: (command: string) => void;
}

/** LEAKING — detection grid, not a task table. */
export function LeakGrid({ brainOnline, onAsk }: LeakGridProps) {
  const fetchWatch = useCallback(() => brain.watchlist(), []);
  const fetchPulse = useCallback(() => brain.teamPulse(), []);
  const watch = useBrainQuery('leak-watch', fetchWatch, { refreshMs: POLL_FAST_MS });
  const pulse = useBrainQuery('leak-pulse', fetchPulse, {
    refreshMs: POLL_FAST_MS,
    staggerMs: POLL_STAGGER_MS,
  });

  const hits = useMemo(() => {
    if (!brainOnline) return [];
    const out: string[] = [];
    if (hasLiveData(watch.data)) {
      for (const item of (watch.data?.items ?? []) as WatchlistItem[]) {
        const label = itemLabel(item);
        if (label) out.push(label);
      }
    }
    if (hasLiveData(pulse.data)) {
      for (const row of pulse.data?.overdue ?? []) {
        out.push(`${row.person} · ${row.days_late}d`);
      }
    }
    return out.slice(0, 4);
  }, [brainOnline, watch.data, pulse.data]);

  const hot = new Set(hits.map((_, i) => (3 + i * 5) % CELLS));
  const verdict = hits[0] ?? HOLD.leak;

  return (
    <section className="panel-glass leak-grid holo-summon" aria-label="Leaking detection">
      <header>
        <b>LEAKING</b>
        <i className={hits.length ? 'is-proven' : 'is-claimed'}>{hits.length ? 'PROVEN' : 'CLAIMED'}</i>
      </header>
      <p className="panel-glass__job">L1 · FEED OWNERS · INSTANT FORMS · DEAD PHONE</p>
      <div className="leak-grid__cells" aria-hidden>
        {Array.from({ length: CELLS }, (_, i) => (
          <span key={i} className={hot.has(i) ? 'is-hot' : hits.length ? undefined : 'is-hold'} />
        ))}
      </div>
      <p className="panel-glass__verdict">{verdict}</p>
      <button type="button" className="panel-glass__go" onClick={() => onAsk("What's leaking?")}>
        LEAKING
      </button>
    </section>
  );
}
