import type { ReactNode } from 'react';

type LaneIconVariant = 'crm' | 'tasks' | 'audio' | 'calendar';

interface RhinoLaneIconProps {
  variant: LaneIconVariant;
  className?: string;
}

/** Minimal inline SVG kicker icons for intel lanes */
export function RhinoLaneIcon({ variant, className = '' }: RhinoLaneIconProps) {
  const paths: Record<LaneIconVariant, ReactNode> = {
    crm: (
      <>
        <path d="M4 14 L8 6 L12 10 L16 4 L20 10 L24 6 L24 18 L4 18 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M16 4 L17 2 L18 4" fill="currentColor" />
      </>
    ),
    tasks: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M8 12 L11 15 L18 8" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="square" />
      </>
    ),
    audio: (
      <>
        <path d="M12 4 L14 2 L16 4 L16 14 L14 16 L12 14 Z" fill="currentColor" />
        <path d="M6 10 Q6 18 14 18 Q22 18 22 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1" />
        <line x1="8" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
  };

  return (
    <svg
      className={`rhino-lane-icon${className ? ` ${className}` : ''}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {paths[variant]}
    </svg>
  );
}
