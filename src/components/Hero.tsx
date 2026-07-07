import { useCallback } from 'react';
import { brain } from '../api/brain';
import { useBrainQuery } from '../hooks/useBrainQuery';
import './Hero.css';

export function Hero() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening';

  const fetchStatus = useCallback(() => brain.connectorsStatus(), []);
  const { data } = useBrainQuery('hero-connectors', fetchStatus);

  const connected = data?.connected_count ?? 0;
  const total = data?.total ?? 7;
  const allLive = connected > 0 && connected === total;

  return (
    <section className="hero">
      <div className="hero-mesh" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-top">
          <div className="k">Today · {greeting}, Lindsey</div>
          {data && (
            <span
              className={`hero-badge${allLive ? ' hero-badge--live' : ''}`}
              aria-label={`${connected} of ${total} connectors connected`}
            >
              <span className="hero-badge-dot" />
              {connected}/{total} connected
            </span>
          )}
        </div>
        <h2>We got this.</h2>
        <p>
          Your command center — calm, clear, wired to the Brain. Every module shows
          live data when connected, or an honest connect-source state until it is.
        </p>
      </div>
    </section>
  );
}
