import type { EchoVoiceState } from '../hooks/useEchoVoice';
import './live-core.css';

interface LiveCoreProps {
  state?: EchoVoiceState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  label?: string;
  showParticles?: boolean;
  online?: boolean;
}

/** Animated energy core — cyan rings, pulse on activity, live dot integrated */
export function LiveCore({
  state = 'idle',
  size = 'md',
  label = 'Echo core',
  showParticles = false,
  online = true,
}: LiveCoreProps) {
  const stateClass =
    state === 'listening'
      ? ' live-core--listening'
      : state === 'speaking'
        ? ' live-core--speaking'
        : state === 'thinking'
          ? ' live-core--thinking'
          : '';

  const sizeClass =
    size === 'sm'
      ? ' live-core--sm'
      : size === 'lg'
        ? ' live-core--lg'
        : size === 'hero'
          ? ' live-core--hero'
          : '';

  return (
    <div
      className={`live-core${stateClass}${sizeClass}${showParticles ? ' live-core--particles' : ''}${online ? ' live-core--online' : ''}`}
      role="img"
      aria-label={label}
    >
      {showParticles && (
        <div className="live-core__field" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="live-core__particle" style={{ ['--i' as string]: i }} />
          ))}
        </div>
      )}
      <div className="live-core__ring live-core__ring--outer" aria-hidden="true" />
      <div className="live-core__ring live-core__ring--mid" aria-hidden="true" />
      <div className="live-core__ring live-core__ring--inner" aria-hidden="true" />
      <div className="live-core__core" aria-hidden="true" />
      <div className="live-core__pulse" aria-hidden="true" />
      <span className="live-core__dot" aria-hidden="true" />
      {size === 'hero' && (
        <span className={`live-core__label live-core__label--${state}`} aria-hidden="true">
          {state === 'listening'
            ? 'LISTENING'
            : state === 'speaking'
              ? 'SPEAKING'
              : state === 'thinking'
                ? 'THINKING'
                : online
                  ? 'ECHO LIVE'
                  : 'STANDBY'}
        </span>
      )}
    </div>
  );
}
