import { useCallback } from 'react';
import { brain } from '../api/brain';
import { POLL_MODULE_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel, itemTime } from '../utils/renderItems';
import type { WhoopDay } from './whoop';

interface DayOrbitProps {
  brainOnline: boolean;
  whoop: WhoopDay;
  onAsk: (command: string) => void;
}

function fig(n: number | null, suffix = '') {
  if (n == null) return '00';
  if (suffix === 'h') return `${n.toFixed(n % 1 === 0 ? 0 : 1)}H`;
  return String(Math.round(n));
}

/** Day Orbit — calendar nodes + WHOOP. No vanity metrics. */
export function DayOrbit({ brainOnline, whoop, onAsk }: DayOrbitProps) {
  const fetchBrief = useCallback(() => brain.dailyBrief(), []);
  const fetchWeek = useCallback(() => brain.weekAhead(), []);
  const brief = useBrainQuery('orbit-brief', fetchBrief, { refreshMs: POLL_MODULE_MS });
  const week = useBrainQuery('orbit-week', fetchWeek, { refreshMs: POLL_MODULE_MS, staggerMs: 280 });

  const sched = brainOnline && hasLiveData(brief.data?.today_schedule) ? brief.data?.today_schedule.items ?? [] : [];
  const weekItems = brainOnline && hasLiveData(week.data) ? week.data?.items ?? [] : [];
  const nodes = (sched.length ? sched : weekItems).slice(0, 6);
  const calLive = nodes.length > 0;

  return (
    <section className={`panel-glass day-orbit-panel orbit-strip--${whoop.workGate}`} aria-label="Day orbit">
      <header>
        <b>DAY ORBIT</b>
        <i className={calLive || whoop.proven ? 'is-proven' : 'is-claimed'}>
          {calLive || whoop.proven ? 'PROVEN' : 'CLAIMED'}
        </i>
      </header>
      <ol className="day-orbit-panel__nodes">
        {nodes.length ? (
          nodes.map((item, i) => (
            <li key={`${itemTime(item) ?? i}-${itemLabel(item)}`}>
              <em>{itemTime(item) ?? '—'}</em>
              <span>{itemLabel(item) || 'Block'}</span>
            </li>
          ))
        ) : (
          <li className="is-empty">
            <em>—</em>
            <span>{brainOnline ? 'No calendar node on the glass.' : 'Calendar dark — no invented day.'}</span>
          </li>
        )}
      </ol>
      <div className="day-orbit-panel__whoop">
        <b>WHOOP</b>
        <span>
          <em>REC</em> {fig(whoop.recovery)}
        </span>
        <span>
          <em>SLEEP</em> {fig(whoop.sleep, 'h')}
        </span>
        <span>
          <em>STRAIN</em> {fig(whoop.strain)}
        </span>
        <p>{whoop.verdict}</p>
      </div>
      <button type="button" className="panel-glass__go" onClick={() => onAsk('Protect my calendar and WHOOP day.')}>
        ORBIT
      </button>
    </section>
  );
}
