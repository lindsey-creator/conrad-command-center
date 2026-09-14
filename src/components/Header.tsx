import { LiveIndicator } from './LiveIndicator';
import { ReactorCore } from './ReactorCore';
import './Header.css';

interface HeaderProps {
  brainOnline: boolean;
}

const WORDMARK = 'J.A.R.V.I.S.'.split('');

export function Header({ brainOnline }: HeaderProps) {
  return (
    <header className="top hud-corners">
      <div className="brand">
        <ReactorCore size={52} online={brainOnline} label="JARVIS core" />
        <div className="brand__type">
          <h1 className="wordmark-gold brand__wordmark">
            {WORDMARK.map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className="brand__char"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {ch}
              </span>
            ))}
          </h1>
          <div className="brand__underline" aria-hidden="true">
            <span className="brand__underline-run" />
          </div>
          <div className="sub">Command Center · Goldfront OS · Conrad Mortgage</div>
        </div>
      </div>
      <div className="sync">
        <span className={`sync-version${brainOnline ? ' sync-version--live' : ''}`}>
          {brainOnline ? 'BRAIN LIVE' : 'STANDBY'}
        </span>
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
