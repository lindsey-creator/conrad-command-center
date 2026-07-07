import { LiveIndicator } from './LiveIndicator';
import './Header.css';

interface HeaderProps {
  brainOnline: boolean;
}

export function Header({ brainOnline }: HeaderProps) {
  return (
    <header className="top">
      <div className="brand">
        <div className="mark">C</div>
        <div>
          <h1>Conrad Command Center</h1>
          <div className="sub">Enterprise Operations · 8 Business Units</div>
        </div>
      </div>
      <div className="sync">
        // SYS v5
        <br />
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
