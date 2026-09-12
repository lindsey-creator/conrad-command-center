export type Page = 'dashboard' | 'echo' | 'connections';

interface NavProps {
  page: Page;
  onChange: (page: Page) => void;
}

export function Nav({ page, onChange }: NavProps) {
  return (
    <nav className="nav" aria-label="Main">
      <button type="button" className={`nav-btn${page === 'dashboard' ? ' active' : ''}`} onClick={() => onChange('dashboard')}>
        Cockpit
      </button>
      <button type="button" className={`nav-btn${page === 'echo' ? ' active' : ''}`} onClick={() => onChange('echo')}>
        JARVIS
      </button>
      <button type="button" className={`nav-btn${page === 'connections' ? ' active' : ''}`} onClick={() => onChange('connections')}>
        Stack
      </button>
    </nav>
  );
}
