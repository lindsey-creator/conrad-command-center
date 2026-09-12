import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EchoVoiceState } from '../hooks/useEchoVoice';
import { AGENT_LABEL, resolveAgentState, type AgentState } from './agentState';
import { ArcReactor } from './ArcReactor';
import { BootIgnition } from './BootIgnition';
import { CommandDock } from './CommandDock';
import { DayOrbit, LeakingPanel, MoneyNowPanel, Type1Targeting } from './panels';
import './cockpit.css';

const SCAN_LINES = [
  'SCANNING MONEY · WATCH · PULSE',
  'NARRATING — NEVER INVENTING',
  'APPROVAL GATE ARMED',
  'CALENDAR · WHOOP · GHL APPLY',
];

interface CockpitProps {
  brainOnline: boolean;
  onConnect: (source?: string) => void;
}

export function Cockpit({ brainOnline, onConnect }: CockpitProps) {
  const [booted, setBooted] = useState(false);
  const [voiceState, setVoiceState] = useState<EchoVoiceState>('idle');
  const [loading, setLoading] = useState(false);
  const [type1Armed, setType1Armed] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | undefined>();
  const [seed, setSeed] = useState(0);
  const [scanIdx, setScanIdx] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setScanIdx((i) => (i + 1) % SCAN_LINES.length), 3200);
    return () => window.clearInterval(t);
  }, []);

  const agent: AgentState = useMemo(
    () => resolveAgentState(voiceState, loading, type1Armed),
    [voiceState, loading, type1Armed],
  );

  const run = useCallback((text: string) => {
    setPendingCommand(text);
    setSeed((n) => n + 1);
    window.requestAnimationFrame(() => {
      document.getElementById('jarvis-command-input')?.focus();
    });
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={`cockpit cockpit--${agent}${booted ? ' cockpit--live' : ''}`}>
      {!booted && <BootIgnition onDone={() => setBooted(true)} />}
      <div className="cockpit__void" aria-hidden="true">
        <div className="cockpit__scanlines" />
        <div className="cockpit__particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ ['--p' as string]: i }} />
          ))}
        </div>
        <div className="cockpit__vignette" />
      </div>
      <div className="cockpit__frame" aria-hidden="true" />

      <header className="cockpit__chrome">
        <div className="cockpit__brand">
          <span className="cockpit__word">JARVIS</span>
          <span className="cockpit__dot" data-online={brainOnline} />
          <span className="cockpit__link">{brainOnline ? 'BRAIN LIVE' : 'STANDBY'}</span>
        </div>
        <div className={`cockpit__agent cockpit__agent--${agent}`}>{AGENT_LABEL[agent]}</div>
        <div className="cockpit__right">
          <span className="cockpit__clock">{timeStr}</span>
          <button type="button" className="cockpit__stack" onClick={() => onConnect()}>
            STACK
          </button>
        </div>
      </header>

      <main className="cockpit__board">
        <ArcReactor state={agent} online={brainOnline} workingLine={SCAN_LINES[scanIdx]} />
        <Type1Targeting
          brainOnline={brainOnline}
          onCommand={run}
          onArm={setType1Armed}
          onConnect={onConnect}
        />
        <MoneyNowPanel brainOnline={brainOnline} onCommand={run} onConnect={onConnect} />
        <LeakingPanel brainOnline={brainOnline} onCommand={run} onConnect={onConnect} />
        <DayOrbit brainOnline={brainOnline} onCommand={run} onConnect={onConnect} />
      </main>

      <CommandDock
        key={seed}
        brainOnline={brainOnline}
        commandSeed={pendingCommand}
        onVoiceStateChange={setVoiceState}
        onLoadingChange={setLoading}
      />
    </div>
  );
}
