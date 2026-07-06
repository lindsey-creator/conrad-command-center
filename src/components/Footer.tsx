import './Footer.css';

export function Footer() {
  return (
    <footer>
      CONRAD COMMAND CENTER · v5 · built to run from anywhere
      <div className="legend">
        <span>
          <i className="sw" style={{ background: 'var(--go)' }} />
          on track
        </span>
        <span>
          <i className="sw" style={{ background: 'var(--warn)' }} />
          watch
        </span>
        <span>
          <i className="sw" style={{ background: 'var(--crit)' }} />
          critical
        </span>
      </div>
    </footer>
  );
}
