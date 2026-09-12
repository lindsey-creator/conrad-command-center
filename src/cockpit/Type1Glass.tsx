import { TYPE1_QUEUE_CAP, capType1 } from './rhinoLock';
import type { Type1Lock } from './useType1Locks';

interface Type1GlassProps {
  locks: Type1Lock[];
  risen: boolean;
  sinking: boolean;
  onLock: (command: string) => void;
}

/** V2 Talk — Type-1 lock rings + two holographic plates. */
export function Type1Glass({ locks, risen, sinking, onLock }: Type1GlassProps) {
  const rows = capType1(locks);
  const plates = rows.slice(0, 2);
  return (
    <section
      className={`t1glass${risen ? ' is-up' : ''}${sinking ? ' is-down' : ''}`}
      aria-label="Type-1 targeting"
    >
      <ol className="t1glass__rings">
        {rows.map((row, i) => (
          <li key={row.id}>
            <button type="button" className="t1glass__ring" onClick={() => onLock(row.command)}>
              <i />
              <b>TYPE-1 LOCK 0{i + 1}</b>
              <em className={row.proven ? 'is-proven' : 'is-claimed'}>{row.proven ? 'PROVEN' : 'CLAIMED'}</em>
            </button>
          </li>
        ))}
      </ol>
      <div className="holo-rail holo-rail--right">
        {plates.map((row) => (
          <button key={row.id} type="button" className="holo-plate" onClick={() => onLock(row.command)}>
            <b>{row.lane}</b>
            <em>{row.verdict}</em>
            <u className={row.proven ? 'is-proven' : 'is-claimed'}>{row.proven ? 'PROVEN' : 'CLAIMED'}</u>
          </button>
        ))}
      </div>
      <p className="t1glass__cap">TYPE-1 · MAX {TYPE1_QUEUE_CAP} · NO AUTO-SEND</p>
    </section>
  );
}
