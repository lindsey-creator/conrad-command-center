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
        <RhinoMark size={28} className="brand-mark" aria-hidden={false} />
        <div>
          <h1>Echo Command</h1>
          <div className="sub">conradstrong.com</div>
        </div>
      </div>
      <div className="sync">
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
