import { useCallback, useEffect, useState } from 'react';
import { brain } from '../api/brain';
import { POLL_CONNECTORS_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import type { EchoVoiceState } from '../hooks/useEchoVoice';
import { LiveCore } from './LiveCore';
import './command-header.css';

interface CommandHeaderProps {
  voiceState?: EchoVoiceState;
  brainOnline?: boolean;
}

export function CommandHeader({
  voiceState = 'idle',
  brainOnline = false,
}: CommandHeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const isSunday = now.getDay() === 0;

  const fetchStatus = useCallback(() => brain.connectorsStatus(), []);
  const { data } = useBrainQuery('hero-connectors', fetchStatus, {
    refreshMs: POLL_CONNECTORS_MS,
  });

  const connected = data?.connected_count ?? 0;
  const total = data?.total ?? 9;
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
          : brainOnline
            ? 'JARVIS ONLINE'
            : 'ECHO STANDBY';

  const echoActive =
    brainOnline &&
    (voiceState === 'listening' || voiceState === 'speaking' || voiceState === 'thinking');

  return (
    <section className="command-header hud-corners jarvis-glass" aria-label="Command status">
      <div className="command-header__mesh" aria-hidden="true" />

      <div className="command-strip">
        <span className="command-strip__item command-strip__item--brand">OPERATING BRAIN</span>
        <span className="command-strip__sep" aria-hidden="true" />
        <span className="command-strip__item">CONRAD MORTGAGE</span>
        <span className="command-strip__sep" aria-hidden="true" />
        <span className="command-strip__item">ECHO COO</span>
        <span className="command-strip__sep" aria-hidden="true" />
        <span
          className={`command-strip__item command-strip__item--echo${brainOnline ? ' command-strip__item--active' : ''}${echoActive ? ' command-strip__item--pulse' : ''}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="command-header__datetime">
        <span className="command-header__time">{timeStr}</span>
        <span className="command-header__date">{dateStr}</span>
      </div>

      <div className="command-header__inner">
        <div className="command-header__identity">
          <LiveCore state={voiceState} online={brainOnline} label={statusLabel} />
          <div className="command-header__status-block">
            <span className="command-header__label">{statusLabel}</span>
            <h2 className="command-header__name font-serif-name">Lindsey</h2>
            <p className="command-header__greeting">
              {greeting}. Readiness · <strong>{readiness}</strong>
            </p>
            <p className="command-header__cadence">
              {isSunday
                ? 'Sunday compounding review — close the week with 2–3 decisions.'
                : 'Sunday compounding review cadence · 2–3 decisions daily'}
            </p>
          </div>
        </div>
        {data && (
          <div className="command-header__metrics" role="group" aria-label="Live metrics">
            <div className="command-header__metric">
              <div className="command-header__metric-val">
                {connected}<span className="command-header__metric-dim">/{total}</span>
              </div>
              <div className="command-header__metric-lbl">Stack</div>
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
