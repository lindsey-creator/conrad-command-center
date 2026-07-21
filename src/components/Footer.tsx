import './Footer.css';

export function Footer() {
  return (
    <footer>
      <div className="footer__primary">CONRAD COMMAND CENTER · conradstrong.com</div>
      <div className="footer__cadence">
        Press <kbd>J</kbd> anywhere to jump to Jarvis · Sunday compounding review
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
