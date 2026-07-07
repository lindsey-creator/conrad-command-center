import { useCallback, useEffect, useState } from 'react';
import { brain } from '../api/brain';
import { POLL_CONNECTORS_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import type { EchoVoiceState } from '../hooks/useEchoVoice';
import { RhinoCore } from './RhinoCore';
import { RhinoMark } from './RhinoMark';
import './command-header.css';

interface CommandHeaderProps {
  voiceState?: EchoVoiceState;
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

  const statusLabel =
    voiceState === 'listening'
      ? 'ECHO LISTENING'
      : voiceState === 'speaking'
        ? 'ECHO SPEAKING'
        : voiceState === 'thinking'
          ? 'ECHO PROCESSING'
          : 'ECHO ONLINE';

  return (
    <section className="command-header hud-corners rhino-metal" aria-label="Command status">
      <div className="command-header__watermark" aria-hidden="true">
        <RhinoMark size={200} />
      </div>
      <div className="command-header__mesh" aria-hidden="true" />

      <div className="command-strip">
        <span className="command-strip__item command-strip__item--brand">RHINO NETWORK</span>
        <span className="command-strip__sep" aria-hidden="true" />
        <span className="command-strip__item">CONRAD MORTGAGE</span>
        <span className="command-strip__sep" aria-hidden="true" />
        <span className={`command-strip__item command-strip__item--live${allLive ? ' command-strip__item--active' : ''}`}>
          {allLive ? 'LIVE' : connected > 0 ? 'SYNC' : 'STANDBY'}
        </span>
      </div>

      <div className="command-header__datetime">
        <span className="command-header__time">{timeStr}</span>
        <span className="command-header__date">{dateStr}</span>
      </div>

      <div className="command-header__inner">
        <div className="command-header__identity">
          <RhinoCore state={voiceState} label={statusLabel} />
          <div className="command-header__status-block">
            <span className="command-header__label">{statusLabel}</span>
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
                {connected}<span className="command-header__metric-dim">/{total}</span>
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
