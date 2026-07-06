import './Header.css';

interface HeaderProps {
  brainOnline: boolean;
  lastFetched: Date | null;
  stale?: boolean;
}

function formatTime(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function Header({ brainOnline, lastFetched, stale }: HeaderProps) {
  return (
    <header className="top">
      <div className="brand">
        <div className="mark">C</div>
        <div>
          <h1>Conrad Command Center</h1>
          <div className="sub">Enterprise Operations · 8 Business Units</div>
        </div>
      </div>
      <div className="sync">
        SYSTEM v5
        <br />
        <b style={{ color: brainOnline ? 'var(--go)' : 'var(--crit)' }}>
          ●
        </b>{' '}
        {brainOnline ? 'Brain online' : 'Brain offline'}
        {lastFetched && (
          <>
            <br />
            <span className="sync-time">
              {stale ? 'stale · ' : ''}
              {formatTime(lastFetched)}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
