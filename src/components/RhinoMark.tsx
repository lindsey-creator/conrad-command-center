interface RhinoMarkProps {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

/** Geometric rhino mark — horn + armored silhouette, gold on obsidian */
export function RhinoMark({ size = 38, className = '', 'aria-hidden': ariaHidden = true }: RhinoMarkProps) {
  return (
    <svg
      className={`rhino-mark${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      role="img"
      aria-label={ariaHidden ? undefined : 'Rhino Capital mark'}
    >
      <defs>
        <linearGradient id="rhino-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0d878" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#b8942a" />
        </linearGradient>
        <linearGradient id="rhino-horn" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f0d878" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="4" stroke="url(#rhino-gold)" strokeWidth="1.2" fill="#0a0a0e" />
      {/* Armored body plates */}
      <path
        d="M8 34 L14 16 L22 24 L30 12 L38 20 L40 34 Z"
        stroke="url(#rhino-gold)"
        strokeWidth="1.6"
        strokeLinejoin="miter"
        fill="rgba(212,175,55,0.06)"
      />
      {/* Secondary plate */}
      <path
        d="M14 16 L22 24 L30 12"
        stroke="url(#rhino-gold)"
        strokeWidth="0.8"
        opacity="0.4"
        fill="none"
      />
      {/* Horn — prominent geometric */}
      <path d="M30 12 L33 3 L36 12 Z" fill="url(#rhino-horn)" />
      <path d="M33 3 L34 1 L35 3" stroke="#f0d878" strokeWidth="0.5" fill="none" opacity="0.6" />
      {/* Eye slit */}
      <line x1="24" y1="20" x2="28" y2="20" stroke="#f5f0e6" strokeWidth="1.4" opacity="0.75" />
      {/* Horn base accent */}
      <line x1="28" y1="12" x2="34" y2="12" stroke="url(#rhino-gold)" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
