import { LiveIndicator } from './LiveIndicator';
import { LiveCore } from './LiveCore';
import './Header.css';

interface HeaderProps {
  brainOnline: boolean;
}

export function Header({ brainOnline }: HeaderProps) {
  return (
    <header className="top">
      <div className="brand">
        <LiveCore size="sm" online={brainOnline} label="Echo live core" />
        <div>
          <h1 className="wordmark-gold">Echo Command</h1>
          <div className="sub">Operating brain · conradstrong.com · Conrad Mortgage</div>
        </div>
      </div>
      <div className="sync">
        <span className="sync-version">{brainOnline ? 'ECHO LIVE' : 'JARVIS STANDBY'}</span>
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
