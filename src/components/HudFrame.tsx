import { useEffect, useState } from 'react';
import './hud-frame.css';

interface HudFrameProps {
  /** Brain reachable — drives the frame's accent and telemetry readout. */
  online?: boolean;
}

const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

/**
 * Full-viewport HUD chrome: holographic grid, radial vignette, CRT scanlines,
 * animated corner brackets, edge tick rails and a travelling scan sweep.
 *
 * Purely decorative — fixed, pointer-events:none, never intercepts input.
 */
export function HudFrame({ online = false }: HudFrameProps) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hhmmss = clock.toLocaleTimeString('en-GB', { hour12: false });
  const stamp = `${clock.getFullYear()}.${String(clock.getMonth() + 1).padStart(2, '0')}.${String(
    clock.getDate(),
  ).padStart(2, '0')}`;

  return (
    <div className={`hud-frame${online ? ' hud-frame--online' : ''}`} aria-hidden="true">
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
        <span className="hud-frame__val">{hhmmss}</span>
      </div>
      <div className="hud-frame__readout hud-frame__readout--tr">
        <span className="hud-frame__code">DECK 01 · MK V</span>
        <span className="hud-frame__val">{stamp}</span>
      </div>
      <div className="hud-frame__readout hud-frame__readout--bl">
        <span className="hud-frame__code hud-flicker">GOLDFRONT OS · CONRAD</span>
      </div>
      <div className="hud-frame__readout hud-frame__readout--br">
        <span className="hud-frame__code hud-flicker">DIAGNOSTICS NOMINAL</span>
      </div>

      <div className="hud-frame__scanlines" />
    </div>
  );
}
