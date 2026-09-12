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

const DASH: { label: string; text: string }[] = [
  { label: 'DAY ORBIT', text: 'Protect my calendar and WHOOP day.' },
  { label: 'TYPE-1', text: 'Go/approve Type-1' },
  { label: 'LEAKING', text: "What's leaking?" },
  { label: 'MONEY NOW', text: 'Money now — what dollar should I move?' },
];

/** V2 Idle — WHOOP gauges, Arc, filled Cybertruck, claimed distance. */
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
        <p className="idle-deck__ready">TALK MODE READY</p>
        <figure className="idle-deck__beast">
          <span className="idle-deck__truck">
            <span className="idle-deck__cabin" />
            <span className="idle-deck__visor" />
            <span className="idle-deck__bar" />
            <span className="idle-deck__wheel idle-deck__wheel--l" />
            <span className="idle-deck__wheel idle-deck__wheel--r" />
          </span>
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

      <nav className="idle-dash" aria-label="Ultrawide commands">
        {DASH.map((row) => (
          <button key={row.label} type="button" className="idle-dash__tick" onClick={() => onAsk(row.text)}>
            {row.label}
          </button>
        ))}
      </nav>
      <div className="idle-yoke" aria-hidden="true">
        <i />
      </div>
    </section>
  );
}
