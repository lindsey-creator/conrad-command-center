import { LiveIndicator } from './LiveIndicator';
import { RhinoMark } from './RhinoMark';
import './Header.css';

interface HeaderProps {
  brainOnline: boolean;
}

export function Header({ brainOnline }: HeaderProps) {
  return (
    <header className="top">
      <div className="brand">
        <RhinoMark size={52} className="brand-mark" aria-hidden={false} />
        <div>
          <h1 className="wordmark-gold">Echo Command</h1>
          <div className="sub">conradstrong.com · Rhino Capital · Conrad Mortgage · Rhino Network</div>
        </div>
      </div>
      <div className="sync">
        <span className="sync-version">RHINO v6</span>
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
