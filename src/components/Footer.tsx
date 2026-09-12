import './Footer.css';

export function Footer() {
  return (
    <footer>
      <div className="footer__primary">JARVIS · COMMAND CENTER · AT YOUR SERVICE, SIR</div>
      <div className="footer__cadence">
        Type-1 only — MONEY NOW · LEAKING · EFFICIENCY · nothing sends without his gate
      </div>
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
