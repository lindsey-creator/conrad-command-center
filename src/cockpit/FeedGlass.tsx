import type { FeedLine } from './rhinoLock';

interface FeedGlassProps {
  feeds: FeedLine[];
  onAsk: (command: string) => void;
}

/** Four feed bevels — Town pattern / GHL apply fills / Rise QM blockers / Non-QM milestones. */
export function FeedGlass({ feeds, onAsk }: FeedGlassProps) {
  return (
    <nav className="feed-glass" aria-label="Rhino feeds">
      {feeds.map((row) => (
        <button
          key={row.id}
          type="button"
          className={`feed-glass__cut${row.proven ? ' is-proven' : ' is-claimed'}`}
          onClick={() => onAsk(row.command)}
        >
          <b>{row.name}</b>
          <em>{row.line}</em>
          <i>{row.proven ? 'PROVEN' : 'CLAIMED'}</i>
        </button>
      ))}
    </nav>
  );
}
