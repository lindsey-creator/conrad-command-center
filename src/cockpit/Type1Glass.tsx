import { TYPE1_QUEUE_CAP, capType1 } from './rhinoLock';
import type { Type1Lock } from './useType1Locks';

interface Type1GlassProps {
  locks: Type1Lock[];
  risen: boolean;
  sinking: boolean;
  onLock: (command: string) => void;
}

/** ONE Type-1 targeting angular glass POC — viz + one-line verdict, no pills. */
export function Type1Glass({ locks, risen, sinking, onLock }: Type1GlassProps) {
  return (
    <section
      className={`t1glass holo-summon${risen ? ' is-up' : ''}${sinking ? ' is-down' : ''}`}
      aria-label="Type-1 targeting"
    >
      <header className="t1glass__edge">
        <button type="button" className="t1glass__tick" onClick={() => onLock('Go/approve Type-1')}>
          DECISION
        </button>
        <span>TYPE-1 · MAX {TYPE1_QUEUE_CAP}</span>
      </header>
      <p className="panel-glass__job">ESCALATE ONLY · RISE ≠ NON-QM · NO AUTO-SEND</p>
      <ol className="t1glass__locks">
        {capType1(locks).map((row) => (
          <li key={row.id}>
            <button type="button" className="t1glass__lock" onClick={() => onLock(row.command)}>
              <i>{row.id}</i>
              <b>{row.lane}</b>
              <em>{row.verdict}</em>
              <u className={row.proven ? 'is-proven' : 'is-claimed'}>{row.proven ? 'PROVEN' : 'CLAIMED'}</u>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
