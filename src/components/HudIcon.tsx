import type { ReactElement } from 'react';
import './hud-icon.css';

/**
 * Thin line-art HUD glyphs. Deliberately not emoji: emoji render as coloured
 * bitmaps that ignore the palette (they stay blue in alert mode), sit at the
 * wrong optical weight next to 1px HUD strokes, and vary per platform. These
 * are stroked in currentColor, so they inherit the deck's theme.
 */
export type HudIconName =
  | 'phone'
  | 'money'
  | 'chart'
  | 'alert'
  | 'people'
  | 'search'
  | 'clipboard'
  | 'mic'
  | 'headphones'
  | 'agent'
  | 'pulse'
  | 'brain'
  | 'calendar'
  | 'calendar-week'
  | 'shield'
  | 'weather'
  | 'speaker-on'
  | 'speaker-off';

const PATHS: Record<HudIconName, ReactElement> = {
  phone: (
    <path d="M4.5 2.5h3l1.2 3-1.8 1.3a9 9 0 0 0 4.3 4.3l1.3-1.8 3 1.2v3a1 1 0 0 1-1.1 1A13 13 0 0 1 3.5 3.6a1 1 0 0 1 1-1.1Z" />
  ),
  money: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M12.2 7.3A2.6 2.6 0 0 0 10 6.2c-1.3 0-2.3.7-2.3 1.7 0 2.4 4.6 1.2 4.6 3.6 0 1-1 1.8-2.3 1.8a2.6 2.6 0 0 1-2.2-1.1M10 4.9v1.3M10 13.8v1.3" />
    </>
  ),
  chart: (
    <>
      <path d="M3 16.5h14" />
      <path d="M5 13v-3M9 16.5V7M13 16.5V4M17 16.5v-6" />
    </>
  ),
  alert: (
    <>
      <path d="M10 3 2.8 16h14.4L10 3Z" />
      <path d="M10 8v4M10 14.2v.1" />
    </>
  ),
  people: (
    <>
      <circle cx="8" cy="7.5" r="2.8" />
      <path d="M3 16.5a5 5 0 0 1 10 0" />
      <path d="M13.6 5.2a2.8 2.8 0 0 1 0 5.2M14.6 11.9a4.6 4.6 0 0 1 2.9 4.6" />
    </>
  ),
  search: (
    <>
      <circle cx="8.8" cy="8.8" r="5.3" />
      <path d="m12.8 12.8 4 4" />
    </>
  ),
  clipboard: (
    <>
      <path d="M7.4 3.5H5.6a1 1 0 0 0-1 1v11.9a1 1 0 0 0 1 1h8.8a1 1 0 0 0 1-1V4.5a1 1 0 0 0-1-1h-1.8" />
      <rect x="7.4" y="2.2" width="5.2" height="2.6" rx="0.6" />
      <path d="M7.6 8.6h4.8M7.6 11.6h4.8M7.6 14.2h2.8" />
    </>
  ),
  mic: (
    <>
      <rect x="7.8" y="2.3" width="4.4" height="8.4" rx="2.2" />
      <path d="M4.8 9.2a5.2 5.2 0 0 0 10.4 0M10 14.4v3.1M7.4 17.6h5.2" />
    </>
  ),
  headphones: (
    <>
      <path d="M3.4 12.4V10a6.6 6.6 0 0 1 13.2 0v2.4" />
      <rect x="2.6" y="11.6" width="3.4" height="5.2" rx="1.4" />
      <rect x="14" y="11.6" width="3.4" height="5.2" rx="1.4" />
    </>
  ),
  agent: (
    <>
      <rect x="3.6" y="6.4" width="12.8" height="9.4" rx="1.8" />
      <path d="M10 3.2v3.2M7.2 10.2v1.4M12.8 10.2v1.4M8 13.6h4" />
      <path d="M1.8 9.8v2.6M18.2 9.8v2.6" />
    </>
  ),
  pulse: <path d="M2.5 10h3.2l1.8-4.6L10 15l2.2-6.4 1.3 1.4h4" />,
  brain: (
    <>
      <path d="M10 4.2v11.6" />
      <path d="M10 5.1a2.4 2.4 0 0 0-4.3 1.2A2.3 2.3 0 0 0 4.4 10a2.3 2.3 0 0 0 1.1 3.5A2.3 2.3 0 0 0 10 14.6" />
      <path d="M10 5.1a2.4 2.4 0 0 1 4.3 1.2A2.3 2.3 0 0 1 15.6 10a2.3 2.3 0 0 1-1.1 3.5A2.3 2.3 0 0 1 10 14.6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.6" width="14" height="12.4" rx="1.4" />
      <path d="M3 8.4h14M6.8 2.6v3.4M13.2 2.6v3.4" />
    </>
  ),
  'calendar-week': (
    <>
      <rect x="3" y="4.6" width="14" height="12.4" rx="1.4" />
      <path d="M3 8.4h14M6.8 2.6v3.4M13.2 2.6v3.4M7 11.6h2M11 11.6h2M7 14.2h2" />
    </>
  ),
  shield: <path d="M10 2.6 4 5v5.2c0 3.4 2.4 6.4 6 7.3 3.6-.9 6-3.9 6-7.3V5l-6-2.4Z" />,
  weather: (
    <>
      <circle cx="7.4" cy="7.4" r="2.8" />
      <path d="M7.4 2.2v1.3M7.4 11.3v1.3M2.2 7.4h1.3M11.3 7.4h1.3M3.7 3.7l.9.9M10.2 10.2l.9.9M11.1 3.7l-.9.9M4.6 10.2l-.9.9" />
      <path d="M8.6 16.6a3.1 3.1 0 0 1 .5-6.1 4.2 4.2 0 0 1 7.8 1.6 2.4 2.4 0 0 1-.5 4.5H8.6Z" />
    </>
  ),
  'speaker-on': (
    <>
      <path d="M4 7.6h2.6L10.4 4v12L6.6 12.4H4a.8.8 0 0 1-.8-.8V8.4a.8.8 0 0 1 .8-.8Z" />
      <path d="M13.2 7.4a3.6 3.6 0 0 1 0 5.2M15.4 5.2a6.8 6.8 0 0 1 0 9.6" />
    </>
  ),
  'speaker-off': (
    <>
      <path d="M4 7.6h2.6L10.4 4v12L6.6 12.4H4a.8.8 0 0 1-.8-.8V8.4a.8.8 0 0 1 .8-.8Z" />
      <path d="m13.4 7.8 4 4.4M17.4 7.8l-4 4.4" />
    </>
  ),
};

interface HudIconProps {
  name: HudIconName;
  size?: number;
  className?: string;
}

export function HudIcon({ name, size = 16, className }: HudIconProps) {
  return (
    <svg
      className={`hud-icon${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/** True when a string names one of our glyphs. */
export function isHudIcon(v: string): v is HudIconName {
  return v in PATHS;
}
