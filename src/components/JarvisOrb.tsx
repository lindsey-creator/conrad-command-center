import type { JarvisVoiceState } from '../hooks/useJarvisVoice';
import './jarvis-orb.css';

interface JarvisOrbProps {
  state?: JarvisVoiceState;
  size?: 'sm' | 'md';
  label?: string;
}

export function JarvisOrb({ state = 'idle', size = 'md', label = 'JARVIS core' }: JarvisOrbProps) {
  const stateClass =
    state === 'listening'
      ? ' jarvis-orb--listening'
      : state === 'speaking'
        ? ' jarvis-orb--speaking'
        : state === 'thinking'
          ? ' jarvis-orb--thinking'
          : '';

  return (
    <div
      className={`jarvis-orb${stateClass}${size === 'sm' ? ' jarvis-orb--sm' : ''}`}
      role="img"
      aria-label={label}
    >
      <div className="jarvis-orb__ring" aria-hidden="true" />
      <div className="jarvis-orb__ring jarvis-orb__ring--inner" aria-hidden="true" />
      <div className="jarvis-orb__sphere" aria-hidden="true">
        <div className="jarvis-orb__core" aria-hidden="true" />
        <div className="jarvis-orb__particles" aria-hidden="true">
          <span className="jarvis-orb__particle" />
          <span className="jarvis-orb__particle" />
          <span className="jarvis-orb__particle" />
          <span className="jarvis-orb__particle" />
          <span className="jarvis-orb__particle" />
        </div>
      </div>
    </div>
  );
}
