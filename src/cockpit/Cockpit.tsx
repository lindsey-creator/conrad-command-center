import { useCallback, useMemo, useRef, useState } from 'react';
import type { EchoVoiceState } from '../hooks/useEchoVoice';
import { useAudioPulse } from '../hooks/useAudioPulse';
import { BootIgnition } from './BootIgnition';
import { CommandDock } from './CommandDock';
import { DayOrbit } from './DayOrbit';
import { LeakGrid } from './LeakGrid';
import { MoneyRadar } from './MoneyRadar';
import { TalkOrb, type CoreTint } from './TalkOrb';
import { Type1Glass } from './Type1Glass';
import { isAlertIntent, railsForIntent, type DeckMode, type OrbMotion } from './machine';
import { useHudPack } from './useHudPack';
import { useType1Locks } from './useType1Locks';
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
  const pack = useHudPack();
  const whoop = useWhoopDay(brainOnline);
  const locks = useType1Locks(brainOnline);
  const [booted, setBooted] = useState(shot || idleShot || speakDemo);
  const [mode, setMode] = useState<DeckMode>(shot || speakDemo ? 'talk' : 'idle');
  const [motion, setMotion] = useState<OrbMotion>(shot ? 'speak-wave' : 'idle-pulse');
  const [armed, setArmed] = useState(shot);
  const [micLive, setMicLive] = useState(false);
  const [caption, setCaption] = useState(
    shot ? 'Talk Mode. Five-panel glass.' : speakDemo ? 'CLICK SPEAK — TTS demo.' : '',
  );
  const [line, setLine] = useState(shot ? 'SHIP TYPE-1 NOW' : '');
  const [seed, setSeed] = useState<string | undefined>();
  const timers = useRef<number[]>([]);
  const level = useAudioPulse(motion, micLive);

  const leakHot = locks.some((l) => l.lane === 'LEAKING' && l.proven);
  const core: CoreTint = armed || motion === 'alert-flare' ? 'red' : leakHot ? 'amber' : 'blue';

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const sinkThenIdle = useCallback(() => {
    if (shot || speakDemo) return;
    clearTimers();
    setMicLive(false);
    setArmed(false);
    setMode('idle');
    setMotion('idle-pulse');
    setCaption('');
    setLine('');
  }, [shot, speakDemo]);

  const enterListen = useCallback(() => {
    if (shot) return;
    clearTimers();
    setMode('talk');
    setMotion('listen-ripple');
    setMicLive(true);
    setCaption('Listening.');
    setLine('');
  }, [shot]);

  const runTalk = useCallback(
    (q: string) => {
      if (shot) return;
      clearTimers();
      const rails = railsForIntent(q);
      const flare = isAlertIntent(rails);
      setMode('talk');
      setMicLive(false);
      setArmed(flare);
      setMotion('think-swirl');
      setCaption('Thinking.');
      setSeed(undefined);
      later(900, () => {
        if (flare) {
          setMotion('alert-flare');
          setCaption('Type-1 lock.');
        }
      });
      later(flare ? 1280 : 920, () => {
        setMotion('speak-wave');
        setCaption(rails.length === 0 ? 'Brief me. Glass stays. No extra wall.' : 'Talk Mode.');
      });
      later(12000, sinkThenIdle);
    },
    [shot, sinkThenIdle],
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
      if (shot) return;
      if (state === 'listening') {
        setMode('talk');
        setMotion('listen-ripple');
        setMicLive(true);
        setCaption('Listening.');
      }
      if (state === 'speaking') {
        setMotion('speak-wave');
        setMicLive(false);
        setCaption('Speaking.');
      }
      if (state === 'thinking') setMotion('think-swirl');
    },
    [shot],
  );

  return (
    <div
      className={`rhino mode-${mode} motion-${motion} core-${core}${booted ? ' is-live' : ''}${shot ? ' is-shot' : ''}`}
      data-pack={pack}
      data-mode={mode}
      data-core={core}
    >
      {!booted ? <BootIgnition onDone={() => setBooted(true)} /> : null}

      <div className="rhino__void" aria-hidden="true">
        <div className="rhino__scan" />
        <div className="rhino__holo" />
        <div className="rhino__vignette" />
      </div>
      <div className="rhino__frame" aria-hidden="true" />

      <header className="rhino-top">
        <div className="rhino-top__brand">
          <b>JARVIS</b>
          <i data-on={brainOnline} />
          <em>{brainOnline ? 'LIVE' : 'STANDBY'}</em>
        </div>
        <span className="rhino-top__mode">{mode === 'idle' ? 'IDLE' : 'TALK'}</span>
        <span className="rhino-top__motion">{motion.replace('-', ' ').toUpperCase()}</span>
        <span className="rhino-top__pack">{core.toUpperCase()} CORE</span>
        <button type="button" className="rhino-top__stack" onClick={() => onConnect()}>
          STACK
        </button>
      </header>

      <div className="board">
        <MoneyRadar brainOnline={brainOnline} onAsk={ask} />
        <div className="arc-bay" aria-label="Arc core">
          <span className="arc-bay__tag">ARC CORE</span>
          <TalkOrb motion={motion} level={level} dim={mode === 'idle'} core={core} />
        </div>
        <LeakGrid brainOnline={brainOnline} onAsk={ask} />
        <Type1Glass locks={locks} risen sinking={false} onLock={ask} />
        <DayOrbit brainOnline={brainOnline} whoop={whoop} onAsk={ask} />
        <div className="board__voice">
          <p className="caption">{caption}</p>
          <p className="say">{line}</p>
        </div>
      </div>

      <CommandDock
        brainOnline={brainOnline}
        talking={mode === 'talk'}
        listening={motion === 'listen-ripple'}
        seed={seed}
        demoSpeak={speakDemo}
        onWispr={enterListen}
        onSubmit={runTalk}
        onVoiceState={onVoiceState}
        onAnswer={(spoken, claimed) => {
          setLine(spoken);
          if (spoken) {
            setCaption(claimed ? 'CLAIMED — live Brain payload missing.' : 'PROVEN — live Brain payload.');
          }
        }}
        onSpeakEnd={sinkThenIdle}
        onEnd={sinkThenIdle}
      />
    </div>
  );
}
