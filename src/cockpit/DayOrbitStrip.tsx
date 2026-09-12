import { WHOOP_LOW_RECOVERY, type WhoopDay } from './whoop';

function recFig(n: number | null) {
  if (n == null) return '00';
  return `${Math.round(n)}%`;
}

function sleepFig(n: number | null) {
  if (n == null) return '00';
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  if (m <= 0) return `${h}H`;
  return `${h}H ${String(m).padStart(2, '0')}M`;
}

function strainFig(n: number | null) {
  if (n == null) return '00';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function recWord(day: WhoopDay) {
  if (!day.proven || day.recovery == null) return 'CLAIMED';
  return day.recovery < WHOOP_LOW_RECOVERY ? 'LOW' : 'GOOD';
}

function provenWord(ok: boolean) {
  return ok ? 'PROVEN' : 'CLAIMED';
}

function syncFig(day: WhoopDay) {
  if (!day.proven || !day.updatedAt) return 'CLAIMED';
  const d = new Date(day.updatedAt);
  if (Number.isNaN(d.getTime())) return 'CLAIMED';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

interface DayOrbitStripProps {
  day: WhoopDay;
  compact?: boolean;
  onAsk?: () => void;
}

/** Persistent Day Orbit — WHOOP recovery / sleep / strain. Never invent figures. */
export function DayOrbitStrip({ day, compact = false, onAsk }: DayOrbitStripProps) {
  return (
    <button
      type="button"
      className={`orbit-strip orbit-strip--${day.workGate}${compact ? ' is-compact' : ''}${day.proven ? ' is-proven' : ' is-claimed'}`}
      onClick={onAsk}
    >
      <span className="orbit-strip__kicker">
        DAY ORBIT WHOOP
        <i>{day.proven ? 'PROVEN' : 'CLAIMED'}</i>
      </span>
      <span className="orbit-strip__figs">
        <b>
          <em>RECOVERY</em>
          {recFig(day.recovery)}
          <u>{recWord(day)}</u>
        </b>
        <b>
          <em>SLEEP</em>
          {sleepFig(day.sleep)}
          <u>{provenWord(day.proven && day.sleep != null)}</u>
        </b>
        <b>
          <em>STRAIN</em>
          {strainFig(day.strain)}
          <u>{provenWord(day.proven && day.strain != null)}</u>
        </b>
      </span>
      <span className="orbit-strip__sync">
        <em>LAST SYNC</em>
        {syncFig(day)}
      </span>
    </button>
  );
}
