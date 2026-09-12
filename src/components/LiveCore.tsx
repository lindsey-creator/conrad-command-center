import type { EchoVoiceState } from '../hooks/useEchoVoice';
import './live-core.css';

function jarvisActiveRing(state: EchoVoiceState, online: boolean): boolean {
  return online && (state === 'listening' || state === 'speaking' || state === 'thinking');
}

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
  label = 'JARVIS core',
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

  const idleOnline = online && state === 'idle';

  return (
    <div
      className={`live-core${stateClass}${sizeClass}${showParticles ? ' live-core--particles' : ''}${online ? ' live-core--online' : ''}${idleOnline ? ' live-core--reactor' : ''}`}
      role="img"
      aria-label={label}
    >
      <div
        className={`live-core__status-ring${jarvisActiveRing(state, online) ? ' live-core__status-ring--active' : ''}`}
        aria-hidden="true"
      />
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
                  ? 'JARVIS LIVE'
                  : 'STANDBY'}
        </span>
      )}
    </div>
  );
}
