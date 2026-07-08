interface RhinoMarkProps {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

/** Minimal monogram — refined gold ring on obsidian */
export function RhinoMark({ size = 28, className = '', 'aria-hidden': ariaHidden = true }: RhinoMarkProps) {
  return (
    <svg
      className={`rhino-mark${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : 'Echo mark'}
    >
      <rect x="0.5" y="0.5" width="31" height="31" rx="6" stroke="currentColor" strokeWidth="1" fill="#0c0c0e" />
      <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}
