import { useEffect, useRef, useState } from 'react';
import './hud-frame.css';

interface HudFrameProps {
  /** Brain reachable — drives the frame's accent and telemetry readout. */
  online?: boolean;
  /** Crimson defense posture. */
  alert?: boolean;
}

/** Session uptime as HH:MM:SS, counted from first paint. */
function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

/**
 * Full-viewport HUD chrome: holographic grid, radial vignette, CRT scanlines,
 * animated corner brackets, edge tick rails and a travelling scan sweep.
 *
 * Purely decorative — fixed, pointer-events:none, never intercepts input.
 */
export function HudFrame({ online = false, alert = false }: HudFrameProps) {
  const [clock, setClock] = useState(() => new Date());
  const bootRef = useRef(Date.now());

  // Ticked on rAF so the milliseconds actually read as a running counter
  // rather than a stutter, but only ~20x/s so it stays cheap.
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (ms: number) => {
      if (ms - last > 50) {
        setClock(new Date());
        last = ms;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const hhmmss = clock.toLocaleTimeString('en-GB', { hour12: false });
  const millis = String(clock.getMilliseconds()).padStart(3, '0');
  const uptime = formatUptime((clock.getTime() - bootRef.current) / 1000);
  const stamp = `${clock.getFullYear()}.${String(clock.getMonth() + 1).padStart(2, '0')}.${String(
    clock.getDate(),
  ).padStart(2, '0')}`;

  return (
    <div
      className={`hud-frame${online ? ' hud-frame--online' : ''}${alert ? ' hud-frame--alert' : ''}`}
      aria-hidden="true"
    >
      <div className="hud-frame__grid" />
      <div className="hud-frame__vignette" />
      <div className="hud-frame__sweep" />
      <div className="hud-frame__rail hud-frame__rail--left" />
      <div className="hud-frame__rail hud-frame__rail--right" />

      {CORNERS.map((c) => (
        <svg
          key={c}
          className={`hud-frame__bracket hud-frame__bracket--${c}`}
          viewBox="0 0 48 48"
          fill="none"
        >
          <path d="M0 18 V2 Q0 0 2 0 H18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0 30 V44" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path d="M30 0 H44" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="6" cy="6" r="1.6" fill="currentColor" />
        </svg>
      ))}

      <div className="hud-frame__readout hud-frame__readout--tl">
        <span className="hud-frame__code">SYS.CLOCK</span>
        <span className="hud-frame__val">
          {hhmmss}
          <span className="hud-frame__ms">.{millis}</span>
        </span>
        <span className="hud-frame__code">UPTIME {uptime}</span>
      </div>
      <div className="hud-frame__readout hud-frame__readout--tr">
        <span className="hud-frame__code">DECK 01 · MK V</span>
        <span className="hud-frame__val">{stamp}</span>
      </div>
      <div className="hud-frame__readout hud-frame__readout--bl">
        <span className="hud-frame__code hud-flicker">GOLDFRONT OS · CONRAD</span>
      </div>
      <div className="hud-frame__readout hud-frame__readout--br">
        <span className={`hud-frame__code hud-flicker${alert ? ' hud-frame__code--alert' : ''}`}>
          {alert ? 'DEFENSE PROTOCOL ENGAGED' : 'DIAGNOSTICS NOMINAL'}
        </span>
      </div>

      <div className="hud-frame__scanlines" />
    </div>
  );
}
