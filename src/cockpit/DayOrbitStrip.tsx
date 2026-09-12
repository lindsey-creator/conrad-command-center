import type { WhoopDay } from './whoop';

function fig(n: number | null, suffix = '') {
  if (n == null) return '00';
  if (suffix === 'h') return `${n.toFixed(n % 1 === 0 ? 0 : 1)}H`;
  return String(Math.round(n));
}

interface DayOrbitStripProps {
  day: WhoopDay;
  compact?: boolean;
  onAsk?: () => void;
}

/** Persistent Idle Day Orbit — WHOOP recovery / sleep / strain. Not a SaaS card. */
export function DayOrbitStrip({ day, compact = false, onAsk }: DayOrbitStripProps) {
  return (
    <button
      type="button"
      className={`orbit-strip orbit-strip--${day.workGate}${compact ? ' is-compact' : ''}${day.proven ? ' is-proven' : ' is-claimed'}`}
      onClick={onAsk}
    >
      <span className="orbit-strip__kicker">
        DAY ORBIT · WHOOP
        <i>{day.proven ? 'PROVEN' : 'CLAIMED'}</i>
      </span>
      <span className="orbit-strip__figs">
        <b>
          <em>REC</em>
          {fig(day.recovery)}
        </b>
        <b>
          <em>SLEEP</em>
          {fig(day.sleep, 'h')}
        </b>
        <b>
          <em>STRAIN</em>
          {fig(day.strain)}
        </b>
      </span>
      <span className="orbit-strip__verdict">{day.verdict}</span>
    </button>
  );
}
