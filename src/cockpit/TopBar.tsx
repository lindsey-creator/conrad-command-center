import { useEffect, useState } from 'react';

const BOOT = Date.now();

function pad(n: number, w = 2) {
  return String(n).padStart(w, '0');
}

function formatClock(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function formatUptime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

interface TopBarProps {
  brainOnline: boolean;
  mode: 'idle' | 'talk';
  alert?: boolean;
  onStack: () => void;
}

export function TopBar({ brainOnline, mode, alert = false, onStack }: TopBarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 50);
    return () => window.clearInterval(id);
  }, []);

  const date = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;

  return (
    <header className="rhino-top j-top">
      <div className="j-top__clock">
        <span>SYS.CLOCK</span>
        <b>{formatClock(now)}</b>
        <em>
          {date} — UPTIME {formatUptime(Date.now() - BOOT)}
        </em>
      </div>
      <div className="j-top__mark">
        <strong>J.A.R.V.I.S.</strong>
        <u>ARTIFICIAL INTELLIGENCE SYSTEM</u>
      </div>
      <div className="j-top__right">
        <span className={`j-top__status${brainOnline ? ' is-on' : ''}${alert ? ' is-alert' : ''}`}>
          <i />
          {alert ? 'DEFENSE' : brainOnline ? 'ONLINE' : 'STANDBY'}
        </span>
        <em>{mode === 'talk' ? 'VOICE INTERFACE ACTIVE' : 'IDLE MODE'}</em>
        <button type="button" className="rhino-top__stack" onClick={onStack}>
          STACK
        </button>
      </div>
    </header>
  );
}
