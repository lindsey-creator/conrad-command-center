import { useBrainLive } from '../hooks/brainLive';
import './Header.css';

interface LiveIndicatorProps {
  brainOnline: boolean;
}

export function LiveIndicator({ brainOnline }: LiveIndicatorProps) {
  const { lastUpdated, browserOnline, updatedAgo } = useBrainLive();
  const live = brainOnline && browserOnline;

  return (
    <div className="live-indicator" aria-live="polite">
      <span
        className={`sync-dot live-dot${live ? ' sync-dot--online live-dot--pulse' : ' sync-dot--offline'}`}
        aria-hidden="true"
      />
      <span className={`sync-label${live ? ' sync-label--online' : ''}`}>
        {live ? 'Live' : browserOnline ? 'Brain offline' : 'Reconnecting…'}
      </span>
      {lastUpdated && live && (
        <>
          <br />
          <span className="sync-time">Updated {updatedAgo}</span>
        </>
      )}
    </div>
  );
}
