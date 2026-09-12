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
      className={`t1glass${risen ? ' is-up' : ''}${sinking ? ' is-down' : ''}`}
      aria-label="Type-1 targeting"
    >
      <header className="t1glass__edge">
        <span>TYPE-1</span>
        <span>MAX 3</span>
      </header>
      <ol className="t1glass__locks">
        {locks.map((row) => (
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
