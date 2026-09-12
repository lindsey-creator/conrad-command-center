import { WHOOP_LOW_RECOVERY, type WhoopDay } from './whoop';

interface IdleDeckProps {
  brainOnline: boolean;
  whoop: WhoopDay;
  onAsk: (command: string) => void;
}

function recWord(day: WhoopDay) {
  if (!day.proven || day.recovery == null) return 'CLAIMED';
  return day.recovery < WHOOP_LOW_RECOVERY ? 'LOW' : 'GOOD';
}

function fig(n: number | null, kind: 'pct' | 'hrs' | 'n') {
  if (n == null) return '00';
  if (kind === 'pct') return `${Math.round(n)}%`;
  if (kind === 'hrs') {
    const h = Math.floor(n);
    const m = Math.round((n - h) * 60);
    return `${h}:${String(Math.max(0, m)).padStart(2, '0')}`;
  }
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/** V2 Idle — WHOOP gauges, Arc, Cybertruck, claimed distance. No invented miles. */
export function IdleDeck({ brainOnline, whoop, onAsk }: IdleDeckProps) {
  return (
    <section className="idle-deck idle-deck--v2" aria-label="Idle Cybertruck HUD">
      <button type="button" className="idle-deck__whoop idle-deck__whoop--gauges" onClick={() => onAsk('Protect my calendar and WHOOP day.')}>
        <p className="idle-deck__kicker">WHOOP</p>
        <p className="idle-deck__sub">DAY ORBIT</p>
        <span className="idle-deck__rings">
          <b className={whoop.proven && whoop.recovery != null ? 'is-proven' : 'is-claimed'}>
            <i style={{ ['--p' as string]: String(whoop.recovery ?? 0) }} />
            <strong>{fig(whoop.recovery, 'pct')}</strong>
            <em>RECOVERY</em>
            <u>{recWord(whoop)}</u>
          </b>
          <b className={whoop.proven && whoop.sleep != null ? 'is-proven' : 'is-claimed'}>
            <i style={{ ['--p' as string]: String(whoop.sleep != null ? Math.min(100, (whoop.sleep / 10) * 100) : 0) }} />
            <strong>{fig(whoop.sleep, 'hrs')}</strong>
            <em>SLEEP</em>
            <u>{whoop.proven && whoop.sleep != null ? 'PROVEN' : 'CLAIMED'}</u>
          </b>
          <b className={whoop.proven && whoop.strain != null ? 'is-proven' : 'is-claimed'}>
            <i style={{ ['--p' as string]: String(whoop.strain != null ? Math.min(100, (whoop.strain / 21) * 100) : 0) }} />
            <strong>{fig(whoop.strain, 'n')}</strong>
            <em>STRAIN</em>
            <u>{whoop.proven && whoop.strain != null ? 'PROVEN' : 'CLAIMED'}</u>
          </b>
        </span>
      </button>

      <div className="idle-deck__stage">
        <div className="idle-deck__reactor" aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </div>
        <figure className="idle-deck__beast">
          <svg viewBox="0 0 240 110" aria-hidden="true">
            <path d="M40 78 H200" stroke="currentColor" strokeWidth="2.2" />
            <path
              d="M48 78 L62 52 H178 L192 78"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M70 52 L78 28 H162 L170 52" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <rect x="74" y="36" width="92" height="3" fill="currentColor" opacity="0.9" />
            <circle cx="84" cy="86" r="10" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="156" cy="86" r="10" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <figcaption>CYBERTRUCK · MARK III</figcaption>
        </figure>
      </div>

      <div className="idle-deck__range">
        <p className="idle-deck__kicker">TRUCK DISTANCE</p>
        <p className="idle-deck__hero">
          ——<small>MI</small>
        </p>
        <p className="idle-deck__sub">CLAIMED · NO INVENTED MILES</p>
        <p className="idle-deck__sub">{brainOnline ? 'EST. RANGE · BATTERY WAIT LIVE' : 'BRAIN STANDBY'}</p>
      </div>
    </section>
  );
}
