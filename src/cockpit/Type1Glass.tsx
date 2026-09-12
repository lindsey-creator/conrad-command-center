import { TYPE1_QUEUE_CAP, capType1 } from './rhinoLock';
import type { Type1Lock } from './useType1Locks';

interface Type1GlassProps {
  locks: Type1Lock[];
  risen: boolean;
  sinking: boolean;
  onLock: (command: string) => void;
}

/** V2 Talk — Type-1 lock rings only, top-right. */
export function Type1Glass({ locks, risen, sinking, onLock }: Type1GlassProps) {
  return (
    <section
      className={`t1glass t1glass--locks${risen ? ' is-up' : ''}${sinking ? ' is-down' : ''}`}
      aria-label="Type-1 targeting"
    >
      <ol className="t1glass__rings">
        {capType1(locks).map((row, i) => (
          <li key={row.id}>
            <button type="button" className="t1glass__ring" onClick={() => onLock(row.command)}>
              <i />
              <b>TYPE-1 LOCK 0{i + 1}</b>
              <em className={row.proven ? 'is-proven' : 'is-claimed'}>{row.proven ? 'PROVEN' : 'CLAIMED'}</em>
            </button>
          </li>
        ))}
      </ol>
      <p className="t1glass__cap">MAX {TYPE1_QUEUE_CAP} · NO AUTO-SEND</p>
    </section>
  );
}
