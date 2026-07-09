import { useCallback, useEffect, useRef, useState } from 'react';
import {
  brain,
  formatSourceLabel,
  googleConnectUrl,
  whoopConnectUrl,
  type GoogleOAuthStatusResponse,
  type WhoopOAuthStatusResponse,
} from '../api/brain';
import { POLL_CONNECTORS_MS } from '../hooks/brainPoll';
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
    where: 'Mac goldfront-os/.env (FIELDY_API_TOKEN) — copy to Brain .env',
    envVars: ['FIELDY_API_TOKEN'],
  },
  google_calendar: {
    label: 'Google Calendar',
    where: 'Connect Google — Calendar + Gmail read access via OAuth',
    envVars: [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
    ],
  },
  gmail: {
    label: 'Gmail',
    where: 'Uses the same Google OAuth connection as Calendar',
    envVars: [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
    ],
  },
  whoop: {
    label: 'Whoop',
    where: 'Connect Whoop — recovery, HRV, sleep via OAuth',
    envVars: [
      'WHOOP_CLIENT_ID',
      'WHOOP_CLIENT_SECRET',
      'WHOOP_REFRESH_TOKEN',
    ],
  },
  apple_health: {
    label: 'Apple Health',
    where: 'Local JSON export path (display only)',
    envVars: ['APPLE_HEALTH_EXPORT_PATH'],
  },
  meta: {
    label: 'Meta Ads',
    where: 'Meta Business → System User token with ads_read',
    envVars: ['META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID'],
  },
  weather: {
    label: 'Weather (Cleveland)',
    where: 'OpenWeather or similar API key in Brain .env',
    envVars: ['WEATHER_API_KEY'],
  },
};

interface ConnectionsProps {
  focusSource?: string | null;
}

function GoogleConnectWizard() {
  const [status, setStatus] = useState<GoogleOAuthStatusResponse | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const data = await brain.googleOAuthStatus();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load Google setup status');
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const data = await brain.googleOAuthConfig(clientId.trim(), clientSecret.trim());
      setStatus(data);
      setClientSecret('');
      setMessage('Credentials saved. Click Connect Google to sign in.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const connectHref = `${googleConnectUrl()}${googleConnectUrl().includes('?') ? '&' : '?'}start=1`;

  return (
    <div className="google-wizard">
      <p className="feed-hint">
        <a href={status?.credentials_url ?? 'https://console.cloud.google.com/apis/credentials'} target="_blank" rel="noopener noreferrer">
          Open Google Cloud Credentials
        </a>
        {' '}→ enable Calendar + Gmail APIs → create OAuth client → add redirect URI:
      </p>
      {status && (
        <pre className="google-wizard-uri">{status.redirect_uri}</pre>
      )}
      {!status?.has_client_id || !status?.has_client_secret || status?.credentials_look_placeholder ? (
        <>
          {status?.credentials_look_placeholder && (
            <p className="feed-error">
              Placeholder credentials detected in .env — paste your real Client ID and secret from Google Cloud.
            </p>
          )}
          <label className="google-wizard-label" htmlFor="google-client-id">
            Client ID
          </label>
          <input
            id="google-client-id"
            className="google-wizard-input"
            type="text"
            placeholder="….apps.googleusercontent.com"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            autoComplete="off"
          />
          <label className="google-wizard-label" htmlFor="google-client-secret">
            Client secret
          </label>
          <input
            id="google-client-secret"
            className="google-wizard-input"
            type="password"
            placeholder="GOCSPX-…"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            autoComplete="off"
          />
          <div className="feed-actions connection-actions">
            <button
              type="button"
              className="feed-btn"
              disabled={saving || !clientId.trim() || !clientSecret.trim()}
              onClick={() => void handleSave()}
            >
              {saving ? 'Saving…' : 'Save credentials'}
            </button>
          </div>
        </>
      ) : (
        <div className="feed-actions connection-actions">
          {status?.needs_sign_in && (
            <p className="feed-hint google-wizard-ok">
              Credentials saved — click Connect Google to finish sign-in.
            </p>
          )}
          <a className="feed-btn primary" href={connectHref}>
            Connect Google
          </a>
          <button type="button" className="feed-btn secondary" onClick={() => void loadStatus()}>
            Refresh status
          </button>
        </div>
      )}
      {message && <p className="feed-hint google-wizard-ok">{message}</p>}
      {error && <p className="feed-error">{error}</p>}
      <p className="feed-hint">
        Or use the full setup page:{' '}
        <a href={googleConnectUrl()}>{googleConnectUrl()}</a>
      </p>
    </div>
  );
}

function WhoopConnectWizard() {
  const [status, setStatus] = useState<WhoopOAuthStatusResponse | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const data = await brain.whoopOAuthStatus();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load Whoop setup status');
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const data = await brain.whoopOAuthConfig(clientId.trim(), clientSecret.trim());
      setStatus(data);
      setClientSecret('');
      if (data.has_orphaned_refresh_token || (data.has_refresh_token && data.connected)) {
        setMessage('Credentials saved. Whoop should be live — refresh this page.');
      } else {
        setMessage('Credentials saved. Click Connect Whoop to sign in.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const connectHref = `${whoopConnectUrl()}${whoopConnectUrl().includes('?') ? '&' : '?'}start=1`;
  const needsCredentials = !status?.has_client_id || !status?.has_client_secret;
  const needsSignIn = !needsCredentials && !status?.connected;

  return (
    <div className="google-wizard">
      {status?.setup_note && (
        <p className="feed-hint connection-setup-note">{status.setup_note}</p>
      )}
      <p className="feed-hint">
        <a href={status?.credentials_url ?? 'https://developer.whoop.com'} target="_blank" rel="noopener noreferrer">
          Open Whoop Developer Portal
        </a>
        {' '}→ create an app → add redirect URI:
      </p>
      {status && (
        <pre className="google-wizard-uri">{status.redirect_uri}</pre>
      )}
      {needsCredentials ? (
        <>
          <label className="google-wizard-label" htmlFor="whoop-client-id">
            Client ID
          </label>
          <input
            id="whoop-client-id"
            className="google-wizard-input"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            autoComplete="off"
          />
          <label className="google-wizard-label" htmlFor="whoop-client-secret">
            Client secret
          </label>
          <input
            id="whoop-client-secret"
            className="google-wizard-input"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            autoComplete="off"
          />
          <div className="feed-actions connection-actions">
            <button
              type="button"
              className="feed-btn"
              disabled={saving || !clientId.trim() || !clientSecret.trim()}
              onClick={() => void handleSave()}
            >
              {saving ? 'Saving…' : 'Save credentials'}
            </button>
          </div>
        </>
      ) : (
        <div className="feed-actions connection-actions">
          {needsSignIn && (
            <a className="feed-btn primary" href={connectHref}>
              Connect Whoop
            </a>
          )}
          <button type="button" className="feed-btn secondary" onClick={() => void loadStatus()}>
            Refresh status
          </button>
        </div>
      )}
      {message && <p className="feed-hint google-wizard-ok">{message}</p>}
      {error && <p className="feed-error">{error}</p>}
      <p className="feed-hint">
        Or use the full setup page:{' '}
        <a href={whoopConnectUrl()}>{whoopConnectUrl()}</a>
      </p>
    </div>
  );
}

export function Connections({ focusSource }: ConnectionsProps) {
  const fetchStatus = useCallback(() => brain.connectorsStatus(), []);
  const { data, loading, error } = useBrainQuery('connectors-page', fetchStatus, {
    refreshMs: POLL_CONNECTORS_MS,
  });
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
      <section className="feed-section hud-corners">
        <h3>Connections</h3>
        <p className="feed-hint">
          Optional — the app works with zero connectors. Google and Whoop can be
          connected below without editing <code>.env</code> by hand.
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
              className={`feed-section hud-corners connection-card${focused ? ' connection-focused' : ''}`}
              id={`connector-${key}`}
              key={key}
            >
              <div className="connection-head">
                <h3>{help?.label ?? formatSourceLabel([key])}</h3>
                <span
                  className={`status-ring${info.connected ? ' status-ring--live' : ' status-ring--off'}`}
                >
                  <span
                    className={`pill${info.connected ? ' go' : ''}`}
                    aria-label={info.connected ? 'Connected' : 'Not connected'}
                  >
                    {info.connected ? '✓ Live' : 'Not connected'}
                  </span>
                </span>
              </div>
              {help && <p className="feed-hint">{help.where}</p>}
              {info.connected && key === 'ghl' && info.location_label && (
                <p className="feed-hint connection-location">
                  Active location: <strong>{info.location_label}</strong>
                  {info.active_location_id && (
                    <>
                      {' '}
                      (<code>{info.active_location_id}</code>)
                    </>
                  )}
                </p>
              )}
              {info.connected && key === 'ghl' && info.location_note && (
                <p className="feed-hint connection-location-note">{info.location_note}</p>
              )}
              {info.setup_note && (
                <p className="feed-hint connection-setup-note">{info.setup_note}</p>
              )}
              <div className="env-vars">
                {(help?.envVars ?? info.env_vars).map((v) => (
                  <code key={v} className="env-chip">
                    {v}
                  </code>
                ))}
              </div>
              {!info.connected && help && key === 'google_calendar' && (
                <GoogleConnectWizard />
              )}
              {!info.connected && help && key === 'whoop' && (
                <WhoopConnectWizard />
              )}
              {!info.connected && help && key !== 'google_calendar' && key !== 'whoop' && (
                <p className="feed-hint connect-instructions">
                  {key === 'gmail' ? (
                    <>
                      Connect via the Google Calendar card above.
                    </>
                  ) : (
                    <>
                      Add the env vars above to <code>goldfront-os/.env</code> and
                      restart the Brain.
                    </>
                  )}
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
