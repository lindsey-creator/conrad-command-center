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
    return `${h}h ${String(Math.max(0, m)).padStart(2, '0')}m`;
  }
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/** Higgsfield Idle — landscape void, dim Arc, WHOOP strip. No invented miles or scores. */
export function IdleDeck({ brainOnline, whoop, onAsk }: IdleDeckProps) {
  return (
    <section className="idle-deck" aria-label="Idle Cybertruck HUD">
      <div className="idle-deck__brand">
        <h1>JARVIS</h1>
        <p className="idle-deck__mode">
          IDLE MODE
          <i data-on={brainOnline} />
        </p>
        <hr />
        <p className="idle-deck__kicker">SYSTEM STATUS</p>
        <p className="idle-deck__status">
          <i data-on={brainOnline} />
          {brainOnline ? 'NOMINAL' : 'STANDBY'}
        </p>
        <p className="idle-deck__sub">{brainOnline ? 'ALL SYSTEMS OPERATIONAL' : 'BRAIN STANDBY'}</p>
        <figure className="idle-deck__truck">
          <svg viewBox="0 0 88 28" aria-hidden="true">
            <path
              d="M6 20 L14 12 H28 L36 8 H62 L78 14 H84 V20 H6 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="24" cy="20" r="3" fill="none" stroke="currentColor" />
            <circle cx="68" cy="20" r="3" fill="none" stroke="currentColor" />
          </svg>
          <figcaption>
            CYBERTRUCK
            <span>MARK III</span>
          </figcaption>
        </figure>
      </div>

      <div className="idle-deck__scan">
        <svg className="idle-deck__ridge" viewBox="0 0 640 48" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 40 L80 34 L160 38 L240 22 L320 30 L400 14 L480 28 L560 24 L640 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
          />
        </svg>
        <p>LANDSCAPE SCAN</p>
        <p className="idle-deck__sub">REMOTE · OFF GRID · SECURE</p>
      </div>

      <div className="idle-deck__arc">
        <div className="idle-deck__reticle" aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </div>
        <p>ARC CORE</p>
        <p className="idle-deck__sub">DIM</p>
      </div>

      <button type="button" className="orbit-strip idle-deck__whoop-strip" onClick={() => onAsk('Protect my calendar and WHOOP day.')}>
        <span className="orbit-strip__kicker">
          DAY ORBIT WHOOP
          <i className={whoop.proven ? 'is-proven' : 'is-claimed'}>{whoop.proven ? 'PROVEN' : 'CLAIMED'}</i>
        </span>
        <span className="orbit-strip__figs">
          <b className={whoop.proven && whoop.recovery != null ? 'is-proven' : 'is-claimed'}>
            <em>RECOVERY</em>
            {fig(whoop.recovery, 'pct')}
            <u>{recWord(whoop)}</u>
          </b>
          <b className={whoop.proven && whoop.sleep != null ? 'is-proven' : 'is-claimed'}>
            <em>SLEEP</em>
            {fig(whoop.sleep, 'hrs')}
            <u>{whoop.proven && whoop.sleep != null ? 'PROVEN' : 'CLAIMED'}</u>
          </b>
          <b className={whoop.proven && whoop.strain != null ? 'is-proven' : 'is-claimed'}>
            <em>STRAIN</em>
            {fig(whoop.strain, 'n')}
            <u>{whoop.proven && whoop.strain != null ? 'PROVEN' : 'CLAIMED'}</u>
          </b>
        </span>
      </button>
    </section>
  );
}
