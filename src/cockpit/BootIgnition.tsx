import { useEffect, useState } from 'react';

interface BootIgnitionProps {
  onDone: () => void;
}

const STAGES = [
  { at: 0, line: 'J.A.R.V.I.S.', sub: 'ARC IGNITION' },
  { at: 600, line: 'LOOP LOCK', sub: 'OBSERVE → REASON → ACT' },
  { at: 1300, line: 'WISPR READY', sub: 'LISTEN · THINK · SPEAK' },
  { at: 1900, line: 'ONLINE, SIR', sub: 'AUTO vs GO — NEVER AUTO-SEND' },
] as const;

/** Debddj-style sequential system-check tokens. */
const TOKENS = [
  { at: 180, id: 'ARC', label: 'ARC REACTOR' },
  { at: 640, id: 'LOOP', label: 'AGENT LOOP' },
  { at: 1100, id: 'WISPR', label: 'WISPR I/O' },
  { at: 1520, id: 'TTS', label: 'VOICE SYNTH' },
  { at: 1880, id: 'GLASS', label: 'HUD GLASS' },
] as const;

export function BootIgnition({ onDone }: BootIgnitionProps) {
  const [stage, setStage] = useState(0);
  const [ok, setOk] = useState(0);
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
      window.setTimeout(() => setStage(3), STAGES[3].at),
      ...TOKENS.map((token, i) => window.setTimeout(() => setOk(i + 1), token.at)),
      window.setTimeout(() => setOut(true), 2400),
      window.setTimeout(onDone, 2680),
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
      <ol className="boot__tokens">
        {TOKENS.map((token, i) => (
          <li key={token.id} className={i < ok ? 'is-ok' : undefined}>
            <em>{token.label}</em>
            <span>{i < ok ? 'OK' : '…'}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
