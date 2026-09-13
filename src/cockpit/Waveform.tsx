interface WaveformProps {
  level: number;
  live?: boolean;
}

/** Talk Mode live waveform — film still overlay, not a boxed thumbnail. */
export function Waveform({ level, live = false }: WaveformProps) {
  return (
    <div className={`hud-wave${live ? ' is-live' : ''}`} aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => {
        const n = 0.25 + Math.abs(Math.sin(i * 0.55 + level * 6)) * (0.35 + level * 0.7);
        return <i key={i} style={{ ['--h' as string]: n.toFixed(3) }} />;
      })}
    </div>
  );
}
