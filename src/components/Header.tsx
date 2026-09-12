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
        <LiveCore size="sm" online={brainOnline} label="JARVIS core" />
        <div>
          <h1 className="wordmark-gold">JARVIS · Command</h1>
          <div className="sub">Iron Man glass · he/him · Type-1 only</div>
        </div>
      </div>
      <div className="sync">
        <span className="sync-version">{brainOnline ? 'BRAIN LIVE' : 'STANDBY'}</span>
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
