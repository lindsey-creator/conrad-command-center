import { useCallback, useEffect, useState } from 'react';
import { brain } from '../api/brain';
import { useBrainQuery } from '../hooks/useBrainQuery';
import './Hero.css';

export function Hero() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const fetchStatus = useCallback(() => brain.connectorsStatus(), []);
  const { data } = useBrainQuery('hero-connectors', fetchStatus);

  const connected = data?.connected_count ?? 0;
  const total = data?.total ?? 7;
  const allLive = connected > 0 && connected === total;
  const readiness = allLive ? 'OPTIMAL' : connected > 0 ? 'PARTIAL' : 'STANDBY';

  const timeStr = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className="hero hud-corners">
      <div className="hero-mesh" aria-hidden="true" />
      <div className="hero-scan" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-hud-row">
          <div className="hero-status">
            <span
              className={`hero-status-dot${allLive ? ' hero-status-dot--live' : ''}`}
              aria-hidden="true"
            />
            <span className="hero-status-label">JARVIS online</span>
          </div>
          <div className="hero-datetime">
            <span className="hero-time">{timeStr}</span>
            <span className="hero-date">{dateStr}</span>
          </div>
        </div>

        <div className="hero-readiness">
          <span className="hero-readiness-kicker">// SYSTEM</span>
          Readiness · <strong>{readiness}</strong>
        </div>

        <h2>Lindsey</h2>
        <p className="hero-greeting">
          {greeting}. Your command center — calm, clear, wired to the Brain.
        </p>

        {data && (
          <div className="hero-metrics" role="group" aria-label="System metrics">
            <div className="hero-metric">
              <div className="hero-metric-val">
                {connected}<span className="hero-metric-dim">/{total}</span>
              </div>
              <div className="hero-metric-lbl">Connectors</div>
            </div>
            <div className="hero-metric">
              <div
                className={`hero-metric-val${allLive ? ' hero-metric-val--live' : ''}`}
              >
                {allLive ? 'LIVE' : connected > 0 ? 'SYNC' : '—'}
              </div>
              <div className="hero-metric-lbl">Status</div>
            </div>
            <div className="hero-metric">
              <div className="hero-metric-val">8</div>
              <div className="hero-metric-lbl">Units</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
