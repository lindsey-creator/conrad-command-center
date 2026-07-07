import type { EchoVoiceState } from '../hooks/useEchoVoice';
import './rhino-core.css';

interface RhinoCoreProps {
  state?: EchoVoiceState;
  size?: 'sm' | 'md';
  label?: string;
}

/** Animated hex armor ring with horn pulse — replaces globe orb */
export function RhinoCore({ state = 'idle', size = 'md', label = 'Echo core' }: RhinoCoreProps) {
  const stateClass =
    state === 'listening'
      ? ' rhino-core--listening'
      : state === 'speaking'
        ? ' rhino-core--speaking'
        : state === 'thinking'
          ? ' rhino-core--thinking'
          : '';

  return (
    <div
      className={`rhino-core${stateClass}${size === 'sm' ? ' rhino-core--sm' : ''}`}
      role="img"
      aria-label={label}
    >
      <div className="rhino-core__hex rhino-core__hex--outer" aria-hidden="true" />
      <div className="rhino-core__hex rhino-core__hex--mid" aria-hidden="true" />
      <div className="rhino-core__hex rhino-core__hex--inner" aria-hidden="true" />
      <div className="rhino-core__horn" aria-hidden="true" />
      <div className="rhino-core__pulse" aria-hidden="true" />
    </div>
  );
}
