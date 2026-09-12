import { TYPE1_QUEUE_CAP, capType1 } from './rhinoLock';
import type { Type1Lock } from './useType1Locks';

const VERB: Record<Type1Lock['lane'], string> = {
  'MONEY NOW': 'PROCEED',
  LEAKING: 'ADJUST',
  EFFICIENCY: 'HOLD',
};

interface Type1GlassProps {
  locks: Type1Lock[];
  risen: boolean;
  sinking: boolean;
  onLock: (command: string) => void;
}

/** Talk Mode right rail — numbered Type-1 decision chips. */
export function Type1Glass({ locks, risen, sinking, onLock }: Type1GlassProps) {
  return (
    <section
      className={`t1glass${risen ? ' is-up' : ''}${sinking ? ' is-down' : ''}`}
      aria-label="Type-1 targeting"
    >
      <header className="t1glass__edge">
        <span>DECISION</span>
        <span>TYPE-1 · MAX {TYPE1_QUEUE_CAP}</span>
      </header>
      <ol className="t1glass__locks">
        {capType1(locks).map((row, i) => (
          <li key={row.id}>
            <button type="button" className="t1glass__lock" onClick={() => onLock(row.command)}>
              <i>{String(i + 1).padStart(2, '0')}</i>
              <b>{VERB[row.lane]}</b>
              <em>
                {row.lane} · {row.verdict}
              </em>
              <u className={row.proven ? 'is-proven' : 'is-claimed'}>{row.proven ? 'PROVEN' : 'CLAIMED'}</u>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
