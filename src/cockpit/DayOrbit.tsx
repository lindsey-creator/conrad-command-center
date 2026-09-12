import { useCallback } from 'react';
import { brain } from '../api/brain';
import { POLL_MODULE_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { hasLiveData, itemLabel, itemTime } from '../utils/renderItems';
import { DayOrbitStrip } from './DayOrbitStrip';
import type { WhoopDay } from './whoop';
import { HOLD } from './readyAgent';

interface DayOrbitProps {
  brainOnline: boolean;
  whoop: WhoopDay;
  onAsk: (command: string) => void;
}

/** Day Orbit — WHOOP strip + calendar nodes. No vanity metrics. */
export function DayOrbit({ brainOnline, whoop, onAsk }: DayOrbitProps) {
  const fetchBrief = useCallback(() => brain.dailyBrief(), []);
  const fetchWeek = useCallback(() => brain.weekAhead(), []);
  const brief = useBrainQuery('orbit-brief', fetchBrief, { refreshMs: POLL_MODULE_MS });
  const week = useBrainQuery('orbit-week', fetchWeek, { refreshMs: POLL_MODULE_MS, staggerMs: 280 });

  const sched = brainOnline && hasLiveData(brief.data?.today_schedule) ? brief.data?.today_schedule.items ?? [] : [];
  const weekItems = brainOnline && hasLiveData(week.data) ? week.data?.items ?? [] : [];
  const nodes = (sched.length ? sched : weekItems).slice(0, 6);

  return (
    <section className={`day-orbit-panel orbit-strip--${whoop.workGate} holo-glass`} aria-label="Day orbit">
      <DayOrbitStrip day={whoop} onAsk={() => onAsk('Protect my calendar and WHOOP day.')} />
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
            <span>{HOLD.orbit}</span>
          </li>
        )}
      </ol>
    </section>
  );
}
