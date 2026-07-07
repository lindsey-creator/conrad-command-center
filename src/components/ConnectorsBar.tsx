import { useCallback } from 'react';
import { brain } from '../api/brain';
import { POLL_CONNECTORS_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import './ConnectorsBar.css';

interface ConnectorsBarProps {
  onOpenConnections?: () => void;
}

export function ConnectorsBar({ onOpenConnections }: ConnectorsBarProps) {
  const fetchStatus = useCallback(() => brain.connectorsStatus(), []);
  const { data, loading } = useBrainQuery('connectors-status', fetchStatus, {
    refreshMs: POLL_CONNECTORS_MS,
    staggerMs: 200,
  });

  const connected = data?.connected_count ?? 0;
  const total = data?.total ?? 7;

  return (
    <div className="connectors-bar">
      <div className="connectors-bar-label">
        <span className="connectors-dot" data-live={connected > 0} />
        {loading && !data ? 'Checking…' : `${connected} of ${total} connected`}
      </div>
      {data && (
        <div className="connectors-chips">
          {Object.entries(data.connectors).map(([name, info]) => (
            <span
              key={name}
              className={`connector-chip${info.connected ? ' on' : ''}`}
              title={info.env_vars.join(', ')}
            >
              {info.connected ? '✓ ' : ''}
              {name.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
      {onOpenConnections && (
        <button
          type="button"
          className="connectors-manage"
          onClick={onOpenConnections}
        >
          Manage connections
        </button>
      )}
    </div>
  );
}
