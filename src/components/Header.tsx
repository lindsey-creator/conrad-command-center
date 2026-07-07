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
        <RhinoMark size={40} className="brand-mark" aria-hidden={false} />
        <div>
          <h1>Rhino Command</h1>
          <div className="sub">Rhino Capital · Conrad Mortgage · Elite Operator</div>
        </div>
      </div>
      <div className="sync">
        RHINO v6
        <br />
        <LiveIndicator brainOnline={brainOnline} />
      </div>
    </header>
  );
}
