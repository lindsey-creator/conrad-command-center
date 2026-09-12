import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EchoVoiceState } from '../hooks/useEchoVoice';
import { useAudioPulse } from '../hooks/useAudioPulse';
import { BootIgnition } from './BootIgnition';
import { CommandDock } from './CommandDock';
import { IdleDeck } from './IdleDeck';
import { IntentRail } from './IntentRail';
import { TalkOrb, type CoreTint } from './TalkOrb';
import { Type1Glass } from './Type1Glass';
import {
  ALL_INTENTS,
  WISPR_CAPTION,
  WISPR_LABEL,
  intentsForQuery,
  isAlertIntent,
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
import { useAgentJobs } from './useAgentJobs';
import { useWhoopDay } from './useWhoopDay';

function queryFlag(name: string): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(name) === '1';
}

interface CockpitProps {
  brainOnline: boolean;
  onConnect: (source?: string) => void;
}

export function Cockpit({ brainOnline, onConnect }: CockpitProps) {
  const shot = useMemo(() => queryFlag('talk'), []);
  const idleShot = useMemo(() => queryFlag('idle'), []);
  const speakDemo = useMemo(() => queryFlag('speak'), []);
  const forcedWispr = useMemo(() => wisprFromSearch(), []);
  const pack = useHudPack();
  const whoop = useWhoopDay(brainOnline);
  const locks = useType1Locks(brainOnline);
  const jobs = useAgentJobs(brainOnline, locks);
  const [tick, setTick] = useState(0);
  const [wake, setWake] = useState(false);
  const [booted, setBooted] = useState(shot || idleShot || speakDemo);
  const [mode, setMode] = useState<DeckMode>(shot || speakDemo ? 'talk' : 'idle');
  const [wispr, setWispr] = useState<WisprState>(
    forcedWispr ?? (shot || speakDemo ? 'speaking' : 'idle'),
  );
  const [armed, setArmed] = useState(shot && !forcedWispr);
  const [caption, setCaption] = useState(
    forcedWispr
      ? WISPR_CAPTION[forcedWispr]
      : shot
        ? WISPR_CAPTION.speaking
        : speakDemo
          ? 'CLICK SPEAK — TTS demo.'
          : '',
  );
  const [seed, setSeed] = useState<string | undefined>();
  const [intents, setIntents] = useState<IntentId[]>(shot || speakDemo ? ALL_INTENTS : []);
  const locked = shot || Boolean(forcedWispr);
  const motion = motionForWispr(wispr, armed);
  const level = useAudioPulse(motion, wispr === 'listening');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setInterval(() => setTick((n) => n + 1), reduce ? 8000 : 2400);
    return () => window.clearInterval(id);
  }, []);

  const phase = nextLoopPhase(tick);
  const type1Proven = locks.some((l) => l.proven);
  const goArmed = armed || wispr === 'error';
  const autonomy = resolveAutonomy({ phase, type1Proven, goArmed });
  const leakHot = locks.some((l) => l.lane === 'LEAKING' && l.proven);
  const core: CoreTint =
    wispr === 'disabled'
      ? 'slate'
      : wispr === 'error'
        ? 'red'
        : wispr === 'thinking'
          ? 'amber'
          : wispr === 'speaking' || wispr === 'connecting'
            ? 'ice'
            : wispr === 'listening'
              ? 'blue'
              : leakHot || autonomy === 'L2'
                ? 'amber'
                : autonomy === 'L3'
                  ? 'red'
                  : 'ice';

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
    apply({ type: 'listen' });
    setCaption(WISPR_CAPTION.listening);
    setIntents((cur) => (cur.length ? cur : ['type1']));
  }, [apply, locked]);

  const runTalk = useCallback(
    (q: string) => {
      if (locked) return;
      const raised = intentsForQuery(q);
      setMode('talk');
      setArmed(isAlertIntent(raised));
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
    },
    [apply, locked],
  );

  const finishBoot = useCallback(() => {
    setBooted(true);
    setWake(true);
    window.setTimeout(() => setWake(false), 720);
  }, []);

  return (
    <div
      className={`rhino mode-${mode} motion-${motion} core-${core} wispr-${wispr}${booted ? ' is-live' : ''}${wake ? ' is-wake' : ''}${shot || idleShot || speakDemo ? ' is-shot' : ''}${intents.map((id) => ` raise-${id}`).join('')}`}
      style={{ ['--rms' as string]: String(level) }}
      data-pack={pack}
      data-mode={mode}
      data-core={core}
      data-autonomy={autonomy}
      data-phase={phase}
      data-wispr={wispr}
      data-intents={intents.join(',')}
    >
      {!booted ? <BootIgnition onDone={finishBoot} /> : null}
      {wake ? <div className="rhino__flare" aria-hidden="true" /> : null}

      <div className="rhino__void" aria-hidden="true">
        <div className="rhino__scan" />
        <div className="rhino__holo" />
        <div className="rhino__vignette" />
        <div className="rhino__hash rhino__hash--l" />
        <div className="rhino__hash rhino__hash--r" />
      </div>
      <div className="rhino__frame" aria-hidden="true">
        <i className="rhino__cut rhino__cut--tl" />
        <i className="rhino__cut rhino__cut--tr" />
        <i className="rhino__cut rhino__cut--bl" />
        <i className="rhino__cut rhino__cut--br" />
      </div>
      <div className="rhino__omega" aria-hidden="true">
        <span>PWR</span>
        <span>TGT</span>
        <span>NAV</span>
        <span>I/O</span>
      </div>

      <header className="rhino-top">
        <div className="rhino-top__brand">
          <b>JARVIS</b>
          <i data-on={brainOnline} />
          <em>{brainOnline ? 'LIVE' : 'STANDBY'}</em>
          <small>OS v5.0.0</small>
        </div>
        <span className="rhino-top__truck">CYBERTRUCK</span>
        <span className="rhino-top__mode">{mode === 'idle' ? 'IDLE MODE' : 'VOICE INTERFACE'}</span>
        <span className={`rhino-top__wispr is-${wispr}`}>{mode === 'talk' ? WISPR_LABEL[wispr] : 'DAY ORBIT'}</span>
        <span className="rhino-top__pack">{autonomy} CORE</span>
        <button type="button" className="rhino-top__stack" onClick={() => onConnect()}>
          STACK
        </button>
      </header>
      <JobRail level={autonomy} phase={phase} jobs={jobs} />

      <div className="board">
        {mode === 'idle' ? <IdleDeck brainOnline={brainOnline} whoop={whoop} onAsk={ask} /> : null}
        {mode === 'talk' ? <IntentRail raised={intents} onAsk={ask} /> : null}
        {mode === 'talk' ? (
          <div className="arc-bay" aria-label="Arc core">
            <TalkOrb
              motion={motion}
              level={level}
              dim={false}
              hero
              core={core}
              state={wispr}
            />
          </div>
        ) : null}
        {mode === 'talk' ? (
          <Type1Glass locks={locks} risen sinking={false} onLock={ask} />
        ) : null}
        <div className="board__voice">
          <p className="caption">{caption}</p>
        </div>
      </div>

      <CommandDock
        brainOnline={brainOnline}
        talking={mode === 'talk'}
        listening={wispr === 'listening'}
        seed={seed}
        demoSpeak={speakDemo}
        onWispr={enterListen}
        onSubmit={runTalk}
        onVoiceState={onVoiceState}
        onAnswer={(spoken, claimed) => {
          if (!spoken) return;
          apply({ type: 'reply' });
          setCaption(claimed ? 'CLAIMED — Brain key offline.' : spoken);
        }}
        onSpeakEnd={() => apply({ type: 'spoke' })}
        onEnd={sinkThenIdle}
      />
    </div>
  );
}
