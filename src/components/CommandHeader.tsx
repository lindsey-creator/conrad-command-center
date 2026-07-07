import { useCallback, useEffect, useState } from 'react';
import { brain } from '../api/brain';
import { POLL_CONNECTORS_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import type { JarvisVoiceState } from '../hooks/useJarvisVoice';
import { JarvisOrb } from './JarvisOrb';
import './command-header.css';

interface CommandHeaderProps {
  voiceState?: JarvisVoiceState;
}

export function CommandHeader({ voiceState = 'idle' }: CommandHeaderProps) {
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
  const { data } = useBrainQuery('hero-connectors', fetchStatus, {
    refreshMs: POLL_CONNECTORS_MS,
  });

  const connected = data?.connected_count ?? 0;
  const total = data?.total ?? 7;
  const allLive = connected > 0 && connected === total;
  const readiness = allLive ? 'OPTIMAL' : connected > 0 ? 'PARTIAL' : 'STANDBY';

  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const orbLabel =
    voiceState === 'listening'
      ? 'JARVIS listening'
      : voiceState === 'speaking'
        ? 'JARVIS speaking'
        : voiceState === 'thinking'
          ? 'JARVIS processing'
          : 'JARVIS online';

  return (
    <section className="command-header hud-corners" aria-label="Command status">
      <div className="command-header__mesh" aria-hidden="true" />
      <div className="command-header__datetime">
        <span className="command-header__time">{timeStr}</span>
        <span className="command-header__date">{dateStr}</span>
      </div>
      <div className="command-header__inner">
        <div className="command-header__identity">
          <JarvisOrb state={voiceState} label={orbLabel} />
          <div className="command-header__status-block">
            <span className="command-header__label">{orbLabel}</span>
            <h2 className="command-header__name">Lindsey</h2>
            <p className="command-header__greeting">
              {greeting}. Readiness · <strong>{readiness}</strong>
            </p>
          </div>
        </div>
        {data && (
          <div className="command-header__metrics" role="group" aria-label="Live metrics">
            <div className="command-header__metric">
              <div className="command-header__metric-val">
                {connected}<span style={{ fontSize: 11, color: 'var(--faint)' }}>/{total}</span>
              </div>
              <div className="command-header__metric-lbl">Connectors</div>
            </div>
            <div className="command-header__metric">
              <div
                className={`command-header__metric-val${allLive ? ' command-header__metric-val--live' : ''}`}
              >
                {allLive ? 'LIVE' : connected > 0 ? 'SYNC' : '—'}
              </div>
              <div className="command-header__metric-lbl">Status</div>
            </div>
            <div className="command-header__metric">
              <div className="command-header__metric-val">8</div>
              <div className="command-header__metric-lbl">Units</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
