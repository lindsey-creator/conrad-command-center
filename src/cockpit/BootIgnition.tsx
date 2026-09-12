import { useEffect, useState } from 'react';

interface BootIgnitionProps {
  onDone: () => void;
}

const BOOT_MS = 1800;

export function BootIgnition({ onDone }: BootIgnitionProps) {
  const [phase, setPhase] = useState<'ignite' | 'out'>('ignite');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onDone();
      return;
    }
    const fade = window.setTimeout(() => setPhase('out'), BOOT_MS);
    const done = window.setTimeout(onDone, BOOT_MS + 220);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className={`boot${phase === 'out' ? ' boot--out' : ''}`} role="status" aria-live="polite">
      <div className="boot__reactor" aria-hidden="true">
        <span className="boot__ring" />
        <span className="boot__ring boot__ring--mid" />
        <span className="boot__core" />
      </div>
      <p className="boot__title">JARVIS</p>
      <p className="boot__line">REACTOR IGNITION</p>
      <p className="boot__sub">Sir — systems coming online.</p>
    </div>
  );
}
