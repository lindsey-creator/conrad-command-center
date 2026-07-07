interface RhinoMarkProps {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

/** Geometric rhino mark — horn + armored silhouette, gold on dark */
export function RhinoMark({ size = 38, className = '', 'aria-hidden': ariaHidden = true }: RhinoMarkProps) {
  return (
    <svg
      className={`rhino-mark${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      role="img"
      aria-label={ariaHidden ? undefined : 'Rhino Capital mark'}
    >
      <defs>
        <linearGradient id="rhino-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0b83a" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="3" stroke="url(#rhino-gold)" strokeWidth="1" fill="#0d0d12" />
      {/* Body — geometric armored plate */}
      <path
        d="M8 28 L12 14 L18 20 L24 12 L30 18 L32 28 Z"
        stroke="url(#rhino-gold)"
        strokeWidth="1.4"
        strokeLinejoin="miter"
        fill="rgba(201,162,39,0.08)"
      />
      {/* Horn */}
      <path d="M24 12 L26 6 L28 12" fill="url(#rhino-gold)" />
      {/* Eye slit */}
      <line x1="20" y1="17" x2="23" y2="17" stroke="#f5f0e6" strokeWidth="1.2" opacity="0.7" />
      {/* Armor seam */}
      <line x1="12" y1="14" x2="18" y2="20" stroke="url(#rhino-gold)" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}
