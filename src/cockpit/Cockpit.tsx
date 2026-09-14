import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EchoVoiceState } from '../hooks/useEchoVoice';
import { useAudioPulse } from '../hooks/useAudioPulse';
import { AgentPanel } from './AgentPanel';
import { AiCore } from './AiCore';
import { BootIgnition } from './BootIgnition';
import { CommandDock } from './CommandDock';
import { HudLayers } from './HudLayers';
import { IdleDeck } from './IdleDeck';
import { IntentRail } from './IntentRail';
import { SystemPanel } from './SystemPanel';
import { TopBar } from './TopBar';
import { Type1Glass } from './Type1Glass';
import { Waveform } from './Waveform';
import {
  WISPR_CAPTION,
  intentsForQuery,
  isAlertIntent,
  isDefenseCommand,
  motionForWispr,
  reduceWispr,
  wisprFromSearch,
  type DeckMode,
  type IntentId,
  type WisprEvent,
  type WisprState,
} from './machine';
import { useHudPack } from './useHudPack';
import { useType1Locks } from './useType1Locks';
import { JobRail } from './JobRail';
import { nextLoopPhase, resolveAutonomy } from './readyAgent';
import { BRAIN_SILENT, KEY_OFFLINE } from './talkReply';
import { useAgentJobs } from './useAgentJobs';
import { useWhoopDay } from './useWhoopDay';
import { useCalendarWeek } from './useCalendarWeek';

function queryFlag(name: string): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(name) === '1';
}

interface CockpitProps {
  brainOnline: boolean;
  xaiReady?: boolean;
  onConnect: (source?: string) => void;
}

export function Cockpit({ brainOnline, xaiReady = false, onConnect }: CockpitProps) {
  const talkOpen = useMemo(() => queryFlag('talk'), []);
  const idleShot = useMemo(() => queryFlag('idle'), []);
  const speakDemo = useMemo(() => queryFlag('speak'), []);
  const shotLock = useMemo(() => queryFlag('shot'), []);
  const forcedWispr = useMemo(() => wisprFromSearch(), []);
  const pack = useHudPack();
  const whoop = useWhoopDay(brainOnline);
  const calendar = useCalendarWeek(brainOnline);
  const locks = useType1Locks(brainOnline);
  const jobs = useAgentJobs(brainOnline, locks);
  const [tick, setTick] = useState(0);
  const [wake, setWake] = useState(false);
  const [booted, setBooted] = useState(true);
  const [mode, setMode] = useState<DeckMode>(talkOpen || speakDemo ? 'talk' : 'idle');
  const [wispr, setWispr] = useState<WisprState>(forcedWispr ?? (speakDemo ? 'idle' : 'idle'));
  const [armed, setArmed] = useState(false);
  const [defense, setDefense] = useState(queryFlag('alert'));
  const [caption, setCaption] = useState(
    forcedWispr
      ? WISPR_CAPTION[forcedWispr]
      : speakDemo || talkOpen
        ? 'CLICK TALK — microphone opens on this click.'
        : '',
  );
  const [seed, setSeed] = useState<string | undefined>();
  const [armMic, setArmMic] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [intents, setIntents] = useState<IntentId[]>([]);
  const locked = shotLock;
  const scene = speakDemo
    ? 'speak-orb'
    : mode === 'talk' || talkOpen
      ? 'talk-mode'
      : pack === 'cybertruck'
        ? 'cybertruck-ultrawide'
        : 'idle-whoop';
  const motion = motionForWispr(wispr, armed || defense);
  const liveMic = wispr === 'listening' || wispr === 'connecting';
  const level = useAudioPulse(motion, liveMic, micLevel);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setInterval(() => setTick((n) => n + 1), reduce ? 8000 : 2400);
    return () => window.clearInterval(id);
  }, []);

  const phase = nextLoopPhase(tick);
  const type1Proven = locks.some((l) => l.proven);
  const goArmed = armed || wispr === 'error';
  const autonomy = resolveAutonomy({ phase, type1Proven, goArmed });
  const coreStatus = defense
    ? 'DEFENSE'
    : brainOnline
      ? 'OPERATIONAL'
      : 'STANDBY';

  const apply = useCallback(
    (event: WisprEvent) => {
      if (locked) return;
      setWispr((s) => reduceWispr(s, event));
    },
    [locked],
  );

  const sinkThenIdle = useCallback(() => {
    if (locked || speakDemo) return;
    setArmed(false);
    setMode('idle');
    apply({ type: 'end' });
    setCaption('');
    setIntents([]);
  }, [apply, locked, speakDemo]);

  const enterListen = useCallback(() => {
    if (locked) return;
    setMode('talk');
    setIntents((cur) => (cur.length ? cur : ['type1']));
  }, [locked]);

  const requestListen = useCallback(() => {
    enterListen();
    setArmMic((n) => n + 1);
  }, [enterListen]);

  const runTalk = useCallback(
    (q: string) => {
      if (locked) return;
      if (isDefenseCommand(q)) setDefense(true);
      const raised = intentsForQuery(q);
      setMode('talk');
      setArmed(isAlertIntent(raised) || isDefenseCommand(q));
      apply({ type: 'ask' });
      setCaption(WISPR_CAPTION.thinking);
      setIntents(raised);
      setSeed(undefined);
    },
    [apply, locked],
  );

  const ask = useCallback(
    (q: string) => {
      setSeed(q);
      runTalk(q);
    },
    [runTalk],
  );

  const onVoiceState = useCallback(
    (state: EchoVoiceState) => {
      if (locked) return;
      if (state === 'connecting') {
        setMode('talk');
        apply({ type: 'connect' });
        setCaption(WISPR_CAPTION.connecting);
      }
      if (state === 'listening') {
        setMode('talk');
        apply({ type: 'listen' });
        setCaption(WISPR_CAPTION.listening);
      }
      if (state === 'speaking') {
        apply({ type: 'reply' });
        setCaption(WISPR_CAPTION.speaking);
      }
      if (state === 'thinking') {
        apply({ type: 'ask' });
        setCaption(WISPR_CAPTION.thinking);
      }
      if (state === 'error') {
        apply({ type: 'fail' });
        setCaption(WISPR_CAPTION.error);
      }
      if (state === 'disabled') {
        apply({ type: 'disable' });
        setCaption(WISPR_CAPTION.disabled);
      }
      if (state === 'idle') {
        apply({ type: 'end' });
      }
    },
    [apply, locked],
  );

  const finishBoot = useCallback(() => {
    setBooted(true);
    setWake(true);
    window.setTimeout(() => setWake(false), 720);
  }, []);

  const agents = useMemo(
    () => [
      {
        id: 'brain',
        label: 'BRAIN',
        status: brainOnline ? ('LIVE' as const) : ('STANDBY' as const),
        detail: brainOnline ? 'CLAUDE · /chat' : 'HEALTH STANDBY — /chat still tried',
      },
      {
        id: 'whoop',
        label: 'WHOOP',
        status: whoop.proven ? ('PROVEN' as const) : ('CONNECT' as const),
        detail: whoop.proven && whoop.recovery != null ? `RECOVERY ${Math.round(whoop.recovery)}` : 'NO INVENTED SCORE',
      },
      {
        id: 'cal',
        label: 'CALENDAR',
        status: calendar.proven ? ('PROVEN' as const) : ('CONNECT' as const),
        detail: calendar.proven ? `${calendar.events.length} EVENTS` : 'CONNECT GOOGLE',
      },
      {
        id: 'voice',
        label: 'VOICE',
        status: wispr === 'listening' || wispr === 'speaking' ? ('LIVE' as const) : ('STANDBY' as const),
        detail: wispr.toUpperCase(),
      },
      {
        id: 'type1',
        label: 'TYPE-1',
        status: type1Proven ? ('PROVEN' as const) : ('STANDBY' as const),
        detail: type1Proven ? `${locks.filter((l) => l.proven).length} LOCKS` : 'NO INVENTED DEALS',
      },
      {
        id: 'mem',
        label: 'MEMORY',
        status: 'STANDBY' as const,
        detail: 'PHASE 3 — NOT CONNECTED',
      },
    ],
    [brainOnline, calendar.events.length, calendar.proven, locks, type1Proven, whoop.proven, whoop.recovery, wispr],
  );

  const diags = useMemo(
    () => [
      { label: 'BRAIN', value: brainOnline ? 'CLAUDE' : 'STANDBY', tone: brainOnline ? ('ok' as const) : ('hold' as const) },
      { label: 'WHOOP', value: whoop.proven ? 'PROVEN' : 'CONNECT', tone: whoop.proven ? ('ok' as const) : ('hold' as const) },
      { label: 'CALENDAR', value: calendar.proven ? 'PROVEN' : 'CONNECT', tone: calendar.proven ? ('ok' as const) : ('hold' as const) },
      { label: 'PROTOCOL', value: defense ? 'CRIMSON' : 'NOMINAL', tone: defense ? ('alert' as const) : ('ok' as const) },
      { label: 'AUTONOMY', value: autonomy, tone: autonomy === 'L3' ? ('alert' as const) : ('hold' as const) },
      { label: 'PHASE', value: String(phase), tone: 'hold' as const },
    ],
    [autonomy, brainOnline, calendar.proven, defense, phase, whoop.proven],
  );

  return (
    <div
      className={`rhino is-scene scene-${scene} mode-${mode} motion-${motion} wispr-${wispr}${booted ? ' is-live' : ''}${wake ? ' is-wake' : ''}${shotLock || idleShot ? ' is-shot' : ''}${defense ? ' is-alert' : ''}${intents.map((id) => ` raise-${id}`).join('')}`}
      style={{
        ['--rms' as string]: String(level),
        ['--scene' as string]: `url(/hud-targets/v2/${scene}.png)`,
      }}
      data-pack={pack}
      data-scene={scene}
      data-mode={mode}
      data-autonomy={autonomy}
      data-phase={phase}
      data-wispr={wispr}
      data-intents={intents.join(',')}
    >
      {!booted ? <BootIgnition onDone={finishBoot} /> : null}
      {wake ? <div className="rhino__flare" aria-hidden="true" /> : null}

      <div className="rhino__scene" aria-hidden="true" />
      <div className="rhino__scene-shade" aria-hidden="true" />
      <HudLayers />

      <TopBar brainOnline={brainOnline} mode={mode} alert={defense} onStack={() => onConnect()} />
      <JobRail level={autonomy} phase={phase} jobs={jobs} />

      <div className="board">
        <AgentPanel rows={agents} />
        {mode === 'idle' ? (
          <IdleDeck brainOnline={brainOnline} whoop={whoop} calendar={calendar} onAsk={ask}>
            <AiCore
              compact
              listening={false}
              thinking={false}
              speaking={false}
              alert={defense}
              level={level}
              status={coreStatus}
              onActivate={requestListen}
            />
          </IdleDeck>
        ) : null}
        {mode === 'talk' ? <IntentRail raised={intents} onAsk={ask} /> : null}
        {mode === 'talk' ? (
          <div className="arc-bay" aria-label="Arc core">
            <AiCore
              listening={wispr === 'listening'}
              thinking={wispr === 'thinking'}
              speaking={wispr === 'speaking'}
              alert={defense}
              level={level}
              status={coreStatus}
              onActivate={requestListen}
            />
            <Waveform level={level} live={wispr === 'listening' || wispr === 'speaking'} />
            <p className="arc-bay__type">{caption || 'J.A.R.V.I.S.'}</p>
            <p className="arc-bay__floor" aria-hidden="true">
              {defense ? 'DEFENSE PROTOCOL' : 'I AM ON IT, SIR · AUDIO REACTIVE'}
            </p>
          </div>
        ) : null}
        {mode === 'talk' ? (
          <Type1Glass locks={locks} risen sinking={false} onLock={ask} />
        ) : null}
        <SystemPanel rows={diags} />
        <div className="board__voice">
          <p className="caption">{caption}</p>
        </div>
      </div>

      <CommandDock
        brainOnline={brainOnline}
        xaiReady={xaiReady}
        talking={mode === 'talk'}
        listening={wispr === 'listening'}
        seed={seed}
        demoSpeak={speakDemo}
        armMic={armMic}
        onWispr={enterListen}
        onSubmit={runTalk}
        onVoiceState={onVoiceState}
        onLevel={setMicLevel}
        onAnswer={(spoken, claimed) => {
          if (!spoken) return;
          if (claimed && spoken === KEY_OFFLINE) {
            setCaption('CLAIMED — Brain key offline.');
            return;
          }
          if (claimed && spoken === BRAIN_SILENT) {
            setCaption('CLAIMED — Brain /chat did not respond.');
            return;
          }
          setCaption(spoken);
        }}
        onSpeakEnd={() => apply({ type: 'spoke' })}
        onEnd={sinkThenIdle}
      />
    </div>
  );
}
