import { useCallback, useEffect, useRef, useState } from 'react';
import { brain, type ChatModel } from '../api/brain';
import { useEchoVoice, type EchoVoiceState, type VoiceError } from '../hooks/useEchoVoice';
import { warmSpeech } from '../hooks/speechEngine';
import { ApprovalQueuePanel } from '../components/ApprovalQueuePanel';
import { COMMANDS, needsConfirm } from './commands';
import { BRAIN_SILENT, jarvisSpokenLine } from './talkReply';

const GROK_OFF =
  'GROK STANDBY — add XAI_API_KEY in Settings / Railway. Claude still answers.';

const ERR_COPY: Record<Exclude<VoiceError, null>, string> = {
  'mic-denied': 'MIC BLOCKED — allow the microphone in Chrome, then click TALK again.',
  'mic-missing': 'NO SPEECH ENGINE — use Chrome on this HTTPS URL. Type and EXECUTE still work.',
  insecure: 'INSECURE CONTEXT — open https://jarvis-brain-production-8def.up.railway.app/ Chrome blocks the mic here.',
  network: 'SPEECH NETWORK FAILED — Chrome dictation needs the network. Type the command.',
  'rec-failed': 'LISTEN FAILED — click TALK again, or type and EXECUTE.',
  'tts-missing': 'NO TTS in this browser — captions still run.',
  'tts-blocked': 'TTS BLOCKED — click TALK once to unlock voice, then EXECUTE again.',
};

interface CommandDockProps {
  brainOnline: boolean;
  xaiReady?: boolean;
  talking: boolean;
  listening: boolean;
  seed?: string;
  demoSpeak?: boolean;
  armMic?: number;
  onWispr: () => void;
  onSubmit: (text: string) => void;
  onAnswer: (line: string, claimed: boolean) => void;
  onSpeakEnd: () => void;
  onEnd: () => void;
  onVoiceState?: (state: EchoVoiceState) => void;
  onLevel?: (level: number) => void;
}

export function CommandDock({
  brainOnline,
  xaiReady = false,
  talking,
  listening,
  seed,
  demoSpeak = false,
  armMic = 0,
  onWispr,
  onSubmit,
  onAnswer,
  onSpeakEnd,
  onEnd,
  onVoiceState,
  onLevel,
}: CommandDockProps) {
  const [text, setText] = useState('');
  const [lastSaid, setLastSaid] = useState('');
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<string | null>(null);
  const [originalDraft, setOriginalDraft] = useState('');
  const [banner, setBanner] = useState(
    demoSpeak || talking
      ? 'CLICK TALK — microphone opens in this click. Speak, then I send it to Claude.'
      : '',
  );
  const [pending, setPending] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [thinking, setThinking] = useState(false);
  const [waitSec, setWaitSec] = useState(0);
  const [lane, setLane] = useState<ChatModel>('claude');
  const ref = useRef<HTMLInputElement>(null);
  const askRef = useRef<(q?: string) => Promise<void>>(async () => {});
  const chatAbort = useRef<AbortController | null>(null);
  const askGen = useRef(0);

  const handleTranscript = useCallback((line: string) => setText(line), []);
  const handleFinal = useCallback((line: string) => {
    setText(line);
    void askRef.current(line);
  }, []);

  const voice = useEchoVoice({
    speakEnabled: true,
    onTranscript: handleTranscript,
    onFinalTranscript: handleFinal,
    onState: onVoiceState,
    onLevel,
  });

  useEffect(() => {
    if (!seed) return;
    setText(seed);
    ref.current?.focus();
  }, [seed]);

  useEffect(() => {
    if (voice.voiceError) setBanner(ERR_COPY[voice.voiceError]);
  }, [voice.voiceError]);

  useEffect(() => {
    if (!thinking) return;
    return warmSpeech();
  }, [thinking]);

  useEffect(() => {
    if (!thinking) {
      setWaitSec(0);
      return;
    }
    const t0 = Date.now();
    const id = window.setInterval(() => setWaitSec(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => window.clearInterval(id);
  }, [thinking]);

  useEffect(() => {
    if (!thinking) return;
    const who = lane === 'grok' && xaiReady ? 'GROK' : 'CLAUDE';
    setBanner(`THINKING — ${who} · ${waitSec}s`);
  }, [thinking, waitSec, lane, xaiReady]);

  const hear = async (line: string, sink = false) => {
    voice.unlock();
    const result = await voice.speak(line);
    if (result === 'blocked') setBanner(ERR_COPY['tts-blocked']);
    if (result === 'missing') setBanner(ERR_COPY['tts-missing']);
    if (sink) onSpeakEnd();
  };

  const deliver = async (line: string, claimed: boolean, bannerLine: string) => {
    setLastSaid(line);
    setReply(line);
    setBanner(bannerLine);
    onAnswer(line, claimed);
    voice.setThinking(false);
    setThinking(false);
    await hear(line, false);
  };

  const handleAsk = async (raw?: string, trusted = false) => {
    const query = (raw ?? text).trim();
    if (!query) {
      setBanner('TYPE OR SPEAK A COMMAND — nothing sent.');
      ref.current?.focus();
      return;
    }
    voice.unlock();
    if (!trusted && needsConfirm(query)) {
      setPending(query);
      setBanner('CONFIRM on glass — nothing executes yet.');
      return;
    }
    const useGrok = lane === 'grok' && xaiReady;
    if (lane === 'grok' && !xaiReady) {
      setBanner(GROK_OFF);
    }
    setPending(null);
    voice.stopSpeaking();
    setText(query);
    setReply('');
    setThinking(true);
    const who = useGrok ? 'GROK' : 'CLAUDE';
    setBanner(brainOnline ? `THINKING — ${who} · 0s` : `THINKING — ${who} · health standby`);
    voice.setThinking(true);
    onSubmit(query);
    setApprovalId(null);
    setDraftEdit(null);
    setOriginalDraft('');

    chatAbort.current?.abort();
    const ac = new AbortController();
    chatAbort.current = ac;
    const gen = ++askGen.current;

    try {
      const res = await brain.chat(
        { message: query, ...(useGrok ? { model: 'grok' as const } : {}) },
        ac.signal,
      );
      if (gen !== askGen.current) return;
      if (res.draft) {
        setDraftEdit(res.draft);
        setOriginalDraft(res.draft);
      }
      if (res.approval_id) setApprovalId(res.approval_id);
      const { line, fallback } = jarvisSpokenLine(res);
      const connected = res.mode !== 'connect_source';
      const provenWho = res.mode === 'grok' ? 'GROK' : 'CLAUDE';
      await deliver(
        line,
        fallback || !connected,
        !connected
          ? 'CONNECT — no API key. Add it in Settings / Railway.'
          : fallback
            ? `CLAIMED — ${provenWho} fallback.`
            : `PROVEN — ${provenWho}`,
      );
    } catch (err) {
      if (gen !== askGen.current) return;
      const timed = err instanceof Error && /timed out/i.test(err.message);
      await deliver(
        BRAIN_SILENT,
        true,
        timed
          ? 'CLAIMED — Brain /chat timed out. Try again, or a shorter question.'
          : 'CLAIMED — Brain /chat did not respond.',
      );
    } finally {
      if (gen === askGen.current) {
        voice.setThinking(false);
        setThinking(false);
      }
    }
  };
  askRef.current = handleAsk;

  const beginListen = async () => {
    voice.unlock();
    if (voice.voiceState === 'listening' || voice.voiceState === 'connecting') return;
    if (voice.voiceState === 'speaking') voice.stopSpeaking();
    onWispr();
    setBanner('ALLOW THE MICROPHONE — Chrome will prompt. Then speak.');
    const result = await voice.startListening();
    if (result === 'listening') {
      setBanner('LISTENING — speak now. End of phrase sends to Claude.');
      return;
    }
    if (result === 'denied') {
      setBanner(ERR_COPY['mic-denied']);
      return;
    }
    const code = voice.voiceError && voice.voiceError !== 'rec-failed' ? voice.voiceError : 'mic-missing';
    setBanner(ERR_COPY[code]);
    ref.current?.focus();
  };

  const onSpeakClick = async () => {
    voice.unlock();
    if (voice.voiceState === 'listening' || voice.voiceState === 'connecting') {
      voice.stopListening();
      setBanner('MIC CLOSED — click TALK to listen again.');
      return;
    }
    await beginListen();
  };

  useEffect(() => {
    if (!armMic) return;
    void beginListen();
    // beginListen is click-path; armMic is the reactor tap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armMic]);

  const speakLabel =
    voice.voiceState === 'listening'
      ? 'LISTENING'
      : voice.voiceState === 'speaking'
        ? 'SPEAKING'
        : voice.voiceState === 'thinking'
          ? 'THINKING'
          : voice.voiceState === 'connecting'
            ? 'CONNECTING'
            : voice.voiceState === 'error'
              ? 'ERROR'
              : voice.voiceState === 'disabled'
                ? 'DISABLED'
                : 'TALK';

  return (
    <footer className={`wispr j-comm${talking ? ' wispr--talk' : ''} wispr--${voice.voiceState}`} data-wispr={voice.voiceState}>
      <div className="j-comm__head">
        <i className={voice.voiceState === 'listening' ? 'is-live' : ''} />
        <span>COMM LINK — JARVIS v3.0</span>
        <em>{voice.micSupported ? 'STT READY' : 'STT STANDBY'}</em>
      </div>
      <p className={`wispr__state is-${voice.voiceState}`} aria-live="polite">
        {speakLabel === 'TALK' ? '' : speakLabel}
      </p>
      <p className="wispr__lanes" aria-label="Auto versus GO">
        <em>AUTO · drafts · research · assign · schedule · board</em>
        <strong>GO · send · publish · spend · outreach · sign · $</strong>
      </p>
      <nav className="wispr__chips" aria-label="Command bar">
        {COMMANDS.map((cmd) => (
          <button
            key={cmd.id}
            type="button"
            className={`wispr__chip${cmd.mutate ? ' is-mutate' : ''}`}
            onClick={() => {
              setText(cmd.text);
              ref.current?.focus();
              if (cmd.text.includes('[X]')) {
                setPending(null);
                setBanner('AUTO lane — fill [X], then GO. Drafts/board only. No send.');
                return;
              }
              if (!cmd.mutate) {
                void handleAsk(cmd.text, true);
                return;
              }
              setPending(cmd.text);
              setBanner('GO lane — confirm. Send / publish / spend / $ never auto.');
            }}
          >
            {cmd.label}
          </button>
        ))}
      </nav>
      {pending ? (
        <div className="wispr__confirm" role="alertdialog" aria-label="Confirm command">
          <p>Confirm: {pending}</p>
          <span>State change — does not auto-execute.</span>
          <button
            type="button"
            className="wispr__go"
            onClick={() => void handleAsk(text.trim() || pending, true)}
          >
            CONFIRM
          </button>
          <button
            type="button"
            className="wispr__end"
            onClick={() => {
              setPending(null);
              setBanner('');
            }}
          >
            ABORT
          </button>
        </div>
      ) : null}
      {voice.voiceError ? (
        <p className="wispr__err" role="alert" data-testid="speak-error">
          {ERR_COPY[voice.voiceError]}
        </p>
      ) : null}
      {banner ? (
        <p className={`wispr__banner${voice.voiceError ? ' is-warn' : ''}${thinking ? ' is-think' : ''}`} role="status">
          {banner}
        </p>
      ) : null}
      <div className="wispr__models" role="radiogroup" aria-label="Model">
        <button
          type="button"
          role="radio"
          aria-checked={lane === 'claude'}
          className={`wispr__model${lane === 'claude' ? ' is-on' : ''}`}
          onClick={() => setLane('claude')}
        >
          CLAUDE
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={lane === 'grok'}
          className={`wispr__model${lane === 'grok' ? ' is-on' : ''}${xaiReady ? '' : ' is-off'}`}
          onClick={() => {
            setLane('grok');
            if (!xaiReady) setBanner(GROK_OFF);
          }}
        >
          GROK
        </button>
      </div>
      {reply ? (
        <p className="wispr__reply" data-testid="jarvis-reply" aria-live="polite">
          {reply}
        </p>
      ) : null}
      {draftEdit ? (
        <div className="gate">
          <ApprovalQueuePanel
            approvalId={approvalId}
            draft={draftEdit}
            originalDraft={originalDraft}
            onDraftChange={setDraftEdit}
            onResolved={() => {
              setApprovalId(null);
              setDraftEdit(null);
            }}
          />
        </div>
      ) : null}
      <form
        className="wispr__bar"
        onSubmit={(e) => {
          e.preventDefault();
          voice.unlock();
          void handleAsk();
        }}
      >
        <button
          type="button"
          data-testid="speak-button"
          className={`wispr__speak${listening || voice.voiceState === 'listening' ? ' is-hot' : ''}${voice.voiceState === 'speaking' ? ' is-say' : ''}${voice.voiceState === 'thinking' ? ' is-think' : ''}${voice.voiceState === 'connecting' ? ' is-link' : ''}${voice.voiceState === 'error' ? ' is-err' : ''}${voice.voiceState === 'disabled' ? ' is-off' : ''}`}
          aria-pressed={voice.voiceState === 'listening'}
          onClick={() => void onSpeakClick()}
        >
          {speakLabel}
        </button>
        <input
          id="jarvis-command-input"
          ref={ref}
          className="wispr__line"
          value={text}
          placeholder="Ask JARVIS — Enter executes on Claude"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              voice.unlock();
              void handleAsk();
            }
          }}
        />
        <button type="submit" className="wispr__go">
          EXECUTE
        </button>
        {lastSaid ? (
          <button
            type="button"
            className="wispr__hear"
            onClick={() => {
              voice.unlock();
              void hear(lastSaid, false);
            }}
          >
            HEAR
          </button>
        ) : null}
        {talking ? (
          <button type="button" className="wispr__end" onClick={onEnd}>
            END
          </button>
        ) : null}
      </form>
    </footer>
  );
}
