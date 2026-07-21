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
          <h1 className="wordmark-gold">Conrad Command Center</h1>
          <div className="sub">Jarvis · Echo COO · Goldfront OS · conradstrong.com</div>
        </div>
      </div>
      <div className="sync">
        <span className="sync-version">{brainOnline ? 'ECHO LIVE' : 'JARVIS STANDBY'}</span>
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
