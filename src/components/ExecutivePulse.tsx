import type { EchoVoiceState } from '../hooks/useEchoVoice';
import './executive-pulse.css';

interface ExecutivePulseProps {
  state?: EchoVoiceState;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

/** Minimal executive status indicator — replaces animated Rhino Core */
export function ExecutivePulse({
  state = 'idle',
  size = 'md',
  label = 'Echo status',
}: ExecutivePulseProps) {
  const stateClass =
    state === 'listening'
      ? ' executive-pulse--listening'
      : state === 'speaking'
        ? ' executive-pulse--speaking'
        : state === 'thinking'
          ? ' executive-pulse--thinking'
          : '';

  const sizeClass =
    size === 'sm' ? ' executive-pulse--sm' : size === 'lg' ? ' executive-pulse--lg' : '';

  return (
    <div
      className={`executive-pulse${stateClass}${sizeClass}`}
      role="status"
      aria-label={label}
    >
      <span className="executive-pulse__ring" aria-hidden="true" />
      <span className="executive-pulse__dot" aria-hidden="true" />
    </div>
  );
}
