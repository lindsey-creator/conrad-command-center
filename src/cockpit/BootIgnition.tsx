import { useEffect, useState } from 'react';

interface BootIgnitionProps {
  onDone: () => void;
}

const STAGES = [
  { at: 0, line: 'J.A.R.V.I.S.', sub: 'OBSERVE → REASON → ACT' },
  { at: 700, line: 'LOOP LOCK', sub: 'L0–L3 · EVIDENCE → ESCALATE' },
  { at: 1500, line: 'ONLINE, SIR', sub: 'AUTO vs GO — NEVER AUTO-SEND' },
] as const;

export function BootIgnition({ onDone }: BootIgnitionProps) {
  const [stage, setStage] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onDone();
      return;
    }
    const timers = [
      window.setTimeout(() => setStage(1), STAGES[1].at),
      window.setTimeout(() => setStage(2), STAGES[2].at),
      window.setTimeout(() => setOut(true), 2000),
      window.setTimeout(onDone, 2200),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [onDone]);

  const current = STAGES[stage];

  return (
    <div className={`boot boot--s${stage}${out ? ' boot--out' : ''}`} role="status" aria-live="polite">
      <div className="boot__reactor" aria-hidden="true">
        <span className="boot__ring" />
        <span className="boot__ring boot__ring--mid" />
        <span className="boot__ring boot__ring--outer" />
        <span className="boot__core" />
      </div>
      <p className="boot__title">JARVIS</p>
      <p className="boot__line">{current.line}</p>
      <p className="boot__sub">{current.sub}</p>
    </div>
  );
}
