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
    return m <= 0 ? `${h}H` : `${h}H ${String(m).padStart(2, '0')}M`;
  }
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/** Higgsfield Idle — center Arc, WHOOP rings, no invented range/miles. */
export function IdleDeck({ brainOnline, whoop, onAsk }: IdleDeckProps) {
  return (
    <section className="idle-deck" aria-label="Idle Cybertruck HUD">
      <div className="idle-deck__range">
        <p className="idle-deck__kicker">EST. RANGE</p>
        <p className="idle-deck__hero">—</p>
        <p className="idle-deck__sub">CLAIMED · NO INVENTED MILES</p>
        <p className="idle-deck__sub">{brainOnline ? 'CYBERTRUCK · MARK III' : 'BRAIN STANDBY'}</p>
      </div>

      <div className="idle-deck__core">
        <div className="idle-deck__reactor" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <b />
        </div>
        <svg className="idle-deck__ridge" viewBox="0 0 640 48" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 40 L80 34 L160 38 L240 22 L320 30 L400 14 L480 28 L560 24 L640 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
          />
        </svg>
      </div>

      <button type="button" className="idle-deck__whoop" onClick={() => onAsk('Protect my calendar and WHOOP day.')}>
        <p className="idle-deck__kicker">DAY ORBIT</p>
        <p className="idle-deck__sub">WHOOP RECOVERY / SLEEP / STRAIN</p>
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
    </section>
  );
}
