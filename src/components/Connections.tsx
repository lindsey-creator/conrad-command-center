import { useCallback, useEffect, useRef } from 'react';
import { brain, formatSourceLabel } from '../api/brain';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { SOURCE_TO_CONNECTOR } from '../utils/connectors';

const CONNECTOR_HELP: Record<
  string,
  { label: string; where: string; envVars: string[] }
> = {
  ghl: {
    label: 'GoHighLevel CRM',
    where: 'Sub-account → Settings → Private Integrations → Create',
    envVars: ['GHL_API_KEY', 'GHL_LOCATION_ID'],
  },
  clickup: {
    label: 'ClickUp',
    where: 'app.clickup.com → Settings → Apps → API Token',
    envVars: ['CLICKUP_API_TOKEN', 'CLICKUP_WORKSPACE_ID'],
  },
  fieldy: {
    label: 'Fieldy',
    where: 'fieldy.ai → account API settings',
    envVars: ['FIELDY_API_TOKEN'],
  },
  google_calendar: {
    label: 'Google Calendar',
    where: 'Google Cloud OAuth app + refresh token (Calendar scope)',
    envVars: [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
    ],
  },
  gmail: {
    label: 'Gmail',
    where: 'Same Google OAuth app — add Gmail read scope',
    envVars: [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
    ],
  },
  whoop: {
    label: 'Whoop',
    where: 'developer.whoop.com → access token',
    envVars: ['WHOOP_ACCESS_TOKEN'],
  },
  apple_health: {
    label: 'Apple Health',
    where: 'Local JSON export path (display only)',
    envVars: ['APPLE_HEALTH_EXPORT_PATH'],
  },
};

interface ConnectionsProps {
  focusSource?: string | null;
}

export function Connections({ focusSource }: ConnectionsProps) {
  const fetchStatus = useCallback(() => brain.connectorsStatus(), []);
  const { data, loading, error } = useBrainQuery('connectors-page', fetchStatus);
  const scrolled = useRef(false);

  useEffect(() => {
    if (!focusSource || scrolled.current) return;
    const el = document.getElementById(`connector-${focusSource}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      scrolled.current = true;
    }
  }, [focusSource, data]);

  return (
    <div className="connections-page">
      <section className="feed-section">
        <h3>Connections</h3>
        <p className="feed-hint">
          Optional — the app works with zero connectors. Add keys in{' '}
          <code>goldfront-os/.env</code> when you want live data, then restart
          the Brain.
        </p>
        {error && <p className="feed-error">{error}</p>}
        {loading && !data && <p className="feed-hint">Loading…</p>}
        {data && (
          <p className="connections-summary">
            <strong>{data.connected_count}</strong> of {data.total} connected
            (optional)
          </p>
        )}
      </section>

      {data &&
        Object.entries(data.connectors).map(([key, info]) => {
          const help = CONNECTOR_HELP[key];
          const focused = focusSource === key;
          return (
            <section
              className={`feed-section connection-card${focused ? ' connection-focused' : ''}`}
              id={`connector-${key}`}
              key={key}
            >
              <div className="connection-head">
                <h3>{help?.label ?? formatSourceLabel([key])}</h3>
                <span className={`pill${info.connected ? ' go' : ''}`}>
                  {info.connected ? 'Live' : 'Not connected'}
                </span>
              </div>
              {help && <p className="feed-hint">{help.where}</p>}
              <div className="env-vars">
                {(help?.envVars ?? info.env_vars).map((v) => (
                  <code key={v} className="env-chip">
                    {v}
                  </code>
                ))}
              </div>
              {!info.connected && help && (
                <p className="feed-hint connect-instructions">
                  Add the env vars above to <code>goldfront-os/.env</code> and
                  restart the Brain.
                </p>
              )}
            </section>
          );
        })}

      <section className="feed-section">
        <h3>Ask the Room (full voice)</h3>
        <p className="feed-hint">
          Optional <code>ANTHROPIC_API_KEY</code> in <code>.env</code> for Claude
          narration. Without it, /chat uses honest fallback mode.
        </p>
      </section>
    </div>
  );
}

export function resolveConnectorKey(source: string): string {
  return SOURCE_TO_CONNECTOR[source] ?? source;
}
