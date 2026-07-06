export type Page = 'dashboard' | 'feed' | 'connections';

interface NavProps {
  page: Page;
  onChange: (page: Page) => void;
}

export function Nav({ page, onChange }: NavProps) {
  return (
    <nav className="nav" aria-label="Main">
      <button
        type="button"
        className={`nav-btn${page === 'dashboard' ? ' active' : ''}`}
        onClick={() => onChange('dashboard')}
      >
        Command Center
      </button>
      <button
        type="button"
        className={`nav-btn${page === 'feed' ? ' active' : ''}`}
        onClick={() => onChange('feed')}
      >
        Feed the Brain
      </button>
      <button
        type="button"
        className={`nav-btn${page === 'connections' ? ' active' : ''}`}
        onClick={() => onChange('connections')}
      >
        Connections
      </button>
    </nav>
  );
}
