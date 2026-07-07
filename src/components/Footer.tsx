import './Footer.css';

export function Footer() {
  return (
    <footer>
      <div className="footer__primary">CONRAD COMMAND CENTER · conradstrong.com</div>
      <div className="footer__cadence">
        Sunday compounding review — patient with results, impatient with actions
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
