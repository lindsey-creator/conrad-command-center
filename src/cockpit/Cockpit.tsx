import { useCallback, useMemo, useRef, useState } from 'react';
import { useAudioPulse } from '../hooks/useAudioPulse';
import { BootIgnition } from './BootIgnition';
import { CommandDock } from './CommandDock';
import { TalkOrb } from './TalkOrb';
import { Type1Glass } from './Type1Glass';
import { RAILS, isAlertIntent, railsForIntent, type DeckMode, type OrbMotion, type RailId } from './machine';
import { useType1Locks } from './useType1Locks';

const ORBIT = ['TOWN', 'GHL APPLY', 'CALENDAR', 'WHOOP', 'RISE', 'NON-QM'] as const;

function talkShot(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('talk') === '1';
}

function railLabel(id: RailId) {
  if (id === 'type1') return 'TYPE-1';
  if (id === 'money') return 'MONEY NOW';
  if (id === 'leaking') return 'LEAKING';
  return 'DAY ORBIT';
}

interface CockpitProps {
  brainOnline: boolean;
  onConnect: (source?: string) => void;
}

export function Cockpit({ brainOnline, onConnect }: CockpitProps) {
  const shot = useMemo(() => talkShot(), []);
  const [booted, setBooted] = useState(shot);
  const [mode, setMode] = useState<DeckMode>(shot ? 'talk' : 'idle');
  const [motion, setMotion] = useState<OrbMotion>(shot ? 'speak-wave' : 'idle-pulse');
  const [risen, setRisen] = useState<RailId[]>(shot ? ['type1'] : []);
  const [sinking, setSinking] = useState(false);
  const [micLive, setMicLive] = useState(false);
  const [caption, setCaption] = useState(shot ? 'Talk Mode. Orb owns the center.' : '');
  const [line, setLine] = useState(shot ? 'SHIP TYPE-1 NOW' : '');
  const [seed, setSeed] = useState<string | undefined>();
  const timers = useRef<number[]>([]);
  const locks = useType1Locks(brainOnline);
  const level = useAudioPulse(motion, micLive);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const sinkThenIdle = useCallback(() => {
    if (shot) return;
    clearTimers();
    setSinking(true);
    setMicLive(false);
    later(520, () => {
      setRisen([]);
      setSinking(false);
      setMode('idle');
      setMotion('idle-pulse');
      setCaption('');
      setLine('');
    });
  }, [shot]);

  const enterListen = useCallback(() => {
    if (shot) return;
    clearTimers();
    setMode('talk');
    setSinking(false);
    setRisen([]);
    setMotion('listen-ripple');
    setMicLive(true);
    setCaption('Listening.');
    setLine('');
  }, [shot]);

  const runTalk = useCallback(
    (q: string) => {
      if (shot) return;
      clearTimers();
      const rails = railsForIntent(q).slice(0, 4);
      const flare = isAlertIntent(rails);
      setMode('talk');
      setSinking(false);
      setMicLive(false);
      setRisen([]);
      setMotion('think-swirl');
      setCaption('Thinking.');
      setSeed(undefined);

      later(900, () => {
        if (flare) {
          setMotion('alert-flare');
          setCaption(rails.includes('type1') ? 'Type-1 lock.' : 'Money lock.');
        }
        setRisen(rails);
      });
      later(flare ? 1280 : 920, () => {
        setMotion('speak-wave');
        setCaption(
          rails.length === 0
            ? 'Talk Mode. Brief me does not raise a wall.'
            : 'Talk Mode. Panels rose from the rails.',
        );
      });
      later(7800, sinkThenIdle);
    },
    [shot, sinkThenIdle],
  );

  const extra = risen.filter((id) => id !== 'type1').slice(0, risen.includes('type1') ? 3 : 4);
  const type1Open = risen.includes('type1');
  const flare: 'amber' | 'red' | undefined = risen.includes('type1')
    ? 'red'
    : risen.includes('money')
      ? 'amber'
      : undefined;

  const bevelLine = (id: RailId) => {
    if (id === 'money') return locks[0]?.verdict ?? 'One-line bevel. No table.';
    if (id === 'leaking') return locks[1]?.verdict ?? 'One-line bevel. No table.';
    return 'Day orbit stays faint until asked.';
  };

  return (
    <div
      className={`rhino mode-${mode} motion-${motion}${booted ? ' is-live' : ''}${sinking ? ' is-sinking' : ''}${shot ? ' is-shot' : ''}`}
    >
      {!booted ? <BootIgnition onDone={() => setBooted(true)} /> : null}

      <div className="rhino__void" aria-hidden="true">
        <div className="rhino__scan" />
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
        <button type="button" className="rhino-top__stack" onClick={() => onConnect()}>
          STACK
        </button>
      </header>

      <div className="rhino__stage">
        <TalkOrb motion={motion} level={level} dim={mode === 'idle'} flare={flare} />

        {mode === 'idle' ? (
          <>
            <div className="day-orbit faint" aria-hidden>
              {ORBIT.map((n) => (
                <i key={n}>{n}</i>
              ))}
            </div>
            <nav className="rails" aria-label="Idle rails">
              {RAILS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`rail rail-${id}`}
                  onClick={() => {
                    const label = railLabel(id);
                    setSeed(label);
                    runTalk(label);
                  }}
                >
                  <em />
                  <b>{railLabel(id)}</b>
                </button>
              ))}
            </nav>
          </>
        ) : null}

        {mode === 'talk' ? (
          <div className={`rise-deck${sinking ? ' sink' : ''}`}>
            {type1Open ? (
              <Type1Glass
                locks={locks}
                risen={!sinking}
                sinking={sinking}
                onLock={(command) => {
                  setSeed(command);
                  runTalk(command);
                }}
              />
            ) : null}
            {extra.map((id) => (
              <aside key={id} className={`bevel bevel-${id}`}>
                <b>{railLabel(id)}</b>
                <p>{bevelLine(id)}</p>
              </aside>
            ))}
          </div>
        ) : null}

        <p className="caption">{caption}</p>
        <p className="say">{line}</p>
      </div>

      <CommandDock
        brainOnline={brainOnline}
        talking={mode === 'talk'}
        listening={motion === 'listen-ripple'}
        seed={seed}
        onWispr={enterListen}
        onSubmit={runTalk}
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
