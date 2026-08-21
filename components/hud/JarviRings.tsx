type RingProps = {
  idPrefix: string;
  wordmark?: boolean;
  compact?: boolean;
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, start: number, sweep: number) {
  const a0 = polar(cx, cy, r, start);
  const a1 = polar(cx, cy, r, start + sweep);
  const large = sweep > 180 ? 1 : 0;
  return `M ${a0.x} ${a0.y} A ${r} ${r} 0 ${large} 1 ${a1.x} ${a1.y}`;
}

export function JarviRings({ idPrefix, wordmark = false, compact = false }: RingProps) {
  const ticks = Array.from({ length: 96 }, (_, i) => i);
  const dots = Array.from({ length: 20 }, (_, i) => i);
  const pills = Array.from({ length: 11 }, (_, i) => i);
  const bloom = `${idPrefix}-bloom`;
  const glow = `${idPrefix}-glow`;

  return (
    <svg
      className={`jarvi-rings${compact ? ' jarvi-rings--compact' : ''}`}
      viewBox="0 0 400 400"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bloom} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,229,255,0.34)" />
          <stop offset="42%" stopColor="rgba(0,229,255,0.08)" />
          <stop offset="100%" stopColor="rgba(0,229,255,0)" />
        </radialGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="200" cy="200" r="198" fill={`url(#${bloom})`} />

      <g className="jarvi-rings__spin-slow" filter={`url(#${glow})`}>
        <circle cx="200" cy="200" r="188" fill="none" stroke="rgba(0,229,255,0.22)" strokeWidth="0.7" />
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="rgba(0,229,255,0.4)"
          strokeWidth="0.9"
          strokeDasharray="14 8 3 10"
        />
        {ticks.map((i) => {
          const deg = (i / 96) * 360;
          const major = i % 8 === 0;
          const mid = i % 2 === 0;
          const p0 = polar(200, 200, major ? 154 : mid ? 160 : 163, deg);
          const p1 = polar(200, 200, 172, deg);
          return (
            <line
              key={i}
              x1={p0.x}
              y1={p0.y}
              x2={p1.x}
              y2={p1.y}
              stroke={major ? 'rgba(232,255,255,0.85)' : 'rgba(0,229,255,0.32)'}
              strokeWidth={major ? 1.5 : 0.7}
            />
          );
        })}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const p = polar(200, 200, 178, deg);
          return (
            <text
              key={deg}
              x={p.x}
              y={p.y + 3}
              fill="rgba(180,230,240,0.55)"
              fontSize="9"
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              {deg}
            </text>
          );
        })}
      </g>

      <g className="jarvi-rings__spin-rev">
        <path
          d={arcPath(200, 200, 136, 12, 58)}
          fill="none"
          stroke="rgba(0,229,255,0.88)"
          strokeWidth="7"
        />
        <path
          d={arcPath(200, 200, 136, 86, 18)}
          fill="none"
          stroke="rgba(0,229,255,0.35)"
          strokeWidth="7"
        />
        <path
          d={arcPath(200, 200, 136, 198, 72)}
          fill="none"
          stroke="rgba(0,229,255,0.55)"
          strokeWidth="6"
        />
        <path
          d={arcPath(200, 200, 136, 286, 24)}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="5"
        />
        <circle
          cx="200"
          cy="200"
          r="124"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.6"
          strokeDasharray="2 6"
        />
        {dots.map((i) => {
          const p = polar(200, 200, 146, (i / 20) * 360);
          return <circle key={i} cx={p.x} cy={p.y} r="2.2" fill="rgba(0,229,255,0.9)" />;
        })}
        {pills.map((i) => {
          const deg = 228 + i * 7.2;
          const p = polar(200, 200, 112, deg);
          return (
            <rect
              key={i}
              x={p.x - 2}
              y={p.y - 5}
              width="4"
              height="10"
              rx="2"
              fill="none"
              stroke="rgba(0,229,255,0.75)"
              strokeWidth="0.8"
              transform={`rotate(${deg} ${p.x} ${p.y})`}
            />
          );
        })}
      </g>

      <circle cx="200" cy="200" r="96" fill="none" stroke="rgba(0,229,255,0.62)" strokeWidth="1.2" />
      <circle cx="200" cy="200" r="84" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="0.7" />
      <circle
        cx="200"
        cy="200"
        r="72"
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="0.5"
        strokeDasharray="1 5"
      />

      {wordmark ? (
        <text className="jarvi-rings__mark" x="200" y="206">
          J.A.R.V.I.S.
        </text>
      ) : null}
    </svg>
  );
}

export function MarkRadar({ idPrefix, alert = false }: { idPrefix: string; alert?: boolean }) {
  const rays = Array.from({ length: 16 }, (_, i) => i);
  const rings = [28, 48, 68, 88];
  const hue = alert ? '255,70,50' : '0,229,255';
  return (
    <svg className="mark-radar" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id={`${idPrefix}-disk`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`rgba(${hue},0.16)`} />
          <stop offset="70%" stopColor={`rgba(0,229,255,0.03)`} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#${idPrefix}-disk)`} />
      {rings.map((r) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgba(200,240,255,0.22)"
          strokeWidth="0.6"
        />
      ))}
      {rays.map((i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={100}
            y1={100}
            x2={100 + Math.cos(a) * 90}
            y2={100 + Math.sin(a) * 90}
            stroke="rgba(200,240,255,0.12)"
            strokeWidth="0.5"
          />
        );
      })}
      <circle cx="100" cy="100" r="8" fill="none" stroke={`rgba(${hue},0.9)`} strokeWidth="1" />
      <circle cx="100" cy="100" r="2.2" fill={`rgba(${hue},0.95)`} />
      <line x1="100" y1="8" x2="100" y2="28" stroke={`rgba(${hue},0.85)`} strokeWidth="0.8" />
      <line x1="100" y1="172" x2="100" y2="192" stroke={`rgba(${hue},0.85)`} strokeWidth="0.8" />
      <line x1="8" y1="100" x2="28" y2="100" stroke={`rgba(${hue},0.85)`} strokeWidth="0.8" />
      <line x1="172" y1="100" x2="192" y2="100" stroke={`rgba(${hue},0.85)`} strokeWidth="0.8" />
    </svg>
  );
}

export function CornerPies({ tone = 'cyan' }: { tone?: 'cyan' | 'alert' }) {
  const stroke = tone === 'alert' ? 'rgba(255,72,48,0.82)' : 'rgba(0,229,255,0.78)';
  const corners = ['tl', 'tr', 'br', 'bl'] as const;
  return (
    <div className="widget__pies" aria-hidden="true">
      {corners.map((c) => (
        <svg key={c} className={`widget__pie widget__pie--${c}`} viewBox="0 0 72 72">
          <path d="M6 40 A34 34 0 0 1 40 6" fill="none" stroke={stroke} strokeWidth="1.4" />
          <path
            d="M14 40 A26 26 0 0 1 40 14"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.7"
            strokeDasharray="3 4"
          />
          <path
            d="M6 40 A34 34 0 0 1 18 14"
            fill="none"
            stroke={stroke}
            strokeWidth="4"
            opacity="0.35"
          />
          <line x1="4" y1="46" x2="16" y2="46" stroke={stroke} strokeWidth="1.1" />
          <line x1="46" y1="4" x2="46" y2="16" stroke={stroke} strokeWidth="1.1" />
          <line x1="8" y1="52" x2="12" y2="52" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
          <line x1="52" y1="8" x2="52" y2="12" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        </svg>
      ))}
    </div>
  );
}

export function DegreeStrip() {
  const ticks = Array.from({ length: 48 }, (_, i) => i);
  return (
    <svg className="widget__degrees" viewBox="0 0 240 14" preserveAspectRatio="none" aria-hidden="true">
      {ticks.map((i) => (
        <line
          key={i}
          x1={4 + i * 5}
          y1={i % 6 === 0 ? 1 : 6}
          x2={4 + i * 5}
          y2={13}
          stroke={i % 6 === 0 ? 'rgba(0,229,255,0.55)' : 'rgba(0,229,255,0.22)'}
          strokeWidth="0.7"
        />
      ))}
    </svg>
  );
}

export function DropLines() {
  return (
    <svg className="widget__drops" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line x1="18" y1="16" x2="18" y2="86" stroke="rgba(220,240,255,0.14)" strokeWidth="0.35" strokeDasharray="1 2" />
      <line x1="82" y1="16" x2="82" y2="86" stroke="rgba(220,240,255,0.1)" strokeWidth="0.35" strokeDasharray="1 2" />
    </svg>
  );
}

export function Reticle({ className = '' }: { className?: string }) {
  return (
    <svg className={`reticle ${className}`.trim()} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="11" fill="none" stroke="rgba(255,56,40,0.9)" strokeWidth="1.1" />
      <circle cx="24" cy="24" r="4" fill="none" stroke="rgba(255,56,40,0.95)" strokeWidth="0.8" />
      <line x1="24" y1="2" x2="24" y2="16" stroke="rgba(255,56,40,0.9)" strokeWidth="1" />
      <line x1="24" y1="32" x2="24" y2="46" stroke="rgba(255,56,40,0.9)" strokeWidth="1" />
      <line x1="2" y1="24" x2="16" y2="24" stroke="rgba(255,56,40,0.9)" strokeWidth="1" />
      <line x1="32" y1="24" x2="46" y2="24" stroke="rgba(255,56,40,0.9)" strokeWidth="1" />
    </svg>
  );
}
