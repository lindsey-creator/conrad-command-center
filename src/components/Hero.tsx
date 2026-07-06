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

  return (
    <section className="hero">
      <div className="k">
        Today · {greeting}, Lindsey
        {data && (
          <>
            {' '}
            · {data.connected_count}/{data.total} connected
          </>
        )}
      </div>
      <h2>We got this.</h2>
      <p>
        Your command center — calm, clear, wired to the Brain. Every module shows
        live data when connected, or an honest connect-source state until it is.
      </p>
    </section>
  );
}
