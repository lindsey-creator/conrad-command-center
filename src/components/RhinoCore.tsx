import type { EchoVoiceState } from '../hooks/useEchoVoice';
import './rhino-core.css';

interface RhinoCoreProps {
  state?: EchoVoiceState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  label?: string;
  showParticles?: boolean;
}

/** Animated hex armor ring with horn pulse — elite Rhino Core */
export function RhinoCore({
  state = 'idle',
  size = 'md',
  label = 'Echo core',
  showParticles = false,
}: RhinoCoreProps) {
  const stateClass =
    state === 'listening'
      ? ' rhino-core--listening'
      : state === 'speaking'
        ? ' rhino-core--speaking'
        : state === 'thinking'
          ? ' rhino-core--thinking'
          : '';

  const sizeClass =
    size === 'sm'
      ? ' rhino-core--sm'
      : size === 'lg'
        ? ' rhino-core--lg'
        : size === 'hero'
          ? ' rhino-core--hero'
          : '';

  return (
    <div
      className={`rhino-core${stateClass}${sizeClass}${showParticles ? ' rhino-core--particles' : ''}`}
      role="img"
      aria-label={label}
    >
      {showParticles && (
        <div className="rhino-core__field" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="rhino-core__particle" style={{ ['--i' as string]: i }} />
          ))}
        </div>
      )}
      <div className="rhino-core__hex rhino-core__hex--outer" aria-hidden="true" />
      <div className="rhino-core__hex rhino-core__hex--mid" aria-hidden="true" />
      <div className="rhino-core__hex rhino-core__hex--inner" aria-hidden="true" />
      <div className="rhino-core__horn" aria-hidden="true" />
      <div className="rhino-core__ring" aria-hidden="true" />
      <div className="rhino-core__pulse" aria-hidden="true" />
    </div>
  );
}
