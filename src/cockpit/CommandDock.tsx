import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { brain, type ChatModel } from '../api/brain';
import { useEchoVoice, type EchoVoiceState, type VoiceError } from '../hooks/useEchoVoice';
import { describePickedVoice } from '../hooks/speechEngine';
import { ApprovalQueuePanel } from '../components/ApprovalQueuePanel';
import { COMMANDS, needsConfirm } from './commands';
import { BRAIN_SILENT, jarvisSpokenLine } from './talkReply';

const GROK_OFF = 'GROK STANDBY — Brain has no xAI route yet.';
const MUSE_OFF = 'Muse link not connected — add Muse webhook/API on Brain.';
const ERR_TIMEOUT = 'Brain timed out.';
const ERR_NETWORK = 'Network error.';

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
  museReady?: boolean;
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
  museReady = false,
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
  const [voiceName, setVoiceName] = useState('VOICE · JARVIS UK');
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
    const sync = () => setVoiceName(describePickedVoice());
    sync();
    window.speechSynthesis?.addEventListener('voiceschanged', sync);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', sync);
  }, []);

  useEffect(() => {
    if (!thinking) {
      setWaitSec(0);
      return;
    }
    const t0 = Date.now();
    const id = window.setInterval(() => setWaitSec(Math.floor((Date.now() - t0) / 1000)), 250);
    const beat = window.setInterval(() => {
      void brain.health().catch(() => {});
    }, 3000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(beat);
    };
  }, [thinking]);

  const laneLive =
    lane === 'claude' || (lane === 'grok' && xaiReady) || (lane === 'muse' && museReady);
  const who = lane === 'grok' && xaiReady ? 'GROK' : lane === 'muse' && museReady ? 'MUSE' : 'CLAUDE';
  const statusLine = thinking
    ? `THINKING — ${who} · ${waitSec}s${brainOnline ? '' : ' · health standby'}`
    : banner;

  const hear = (line: string, sink = false) => {
    voice.unlock();
    void voice.speak(line).then((result) => {
      if (result === 'blocked') setBanner(ERR_COPY['tts-blocked']);
      if (result === 'missing') setBanner(ERR_COPY['tts-missing']);
      if (sink) onSpeakEnd();
    });
  };

  const paintAnswer = (line: string, claimed: boolean, bannerLine: string) => {
    flushSync(() => {
      setLastSaid(line);
      setReply(line);
      setBanner(bannerLine);
      setThinking(false);
      voice.setThinking(false);
      onAnswer(line, claimed);
    });
    window.setTimeout(() => hear(line, false), 40);
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
    if (lane === 'grok' && !xaiReady) {
      paintAnswer(GROK_OFF, true, GROK_OFF);
      return;
    }
    if (lane === 'muse' && !museReady) {
      paintAnswer(MUSE_OFF, true, MUSE_OFF);
      return;
    }
    setPending(null);
    voice.stopSpeaking();
    setText(query);
    setReply('');
    setThinking(true);
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
        { message: query, ...(laneLive && lane !== 'claude' ? { model: lane } : {}) },
        ac.signal,
      );
      if (gen !== askGen.current) return;
      if (res.draft) {
        setDraftEdit(res.draft);
        setOriginalDraft(res.draft);
      }
      if (res.approval_id) setApprovalId(res.approval_id);
      const { line, fallback } = jarvisSpokenLine(res);
      const provenWho = res.mode === 'grok' ? 'GROK' : res.mode === 'muse' ? 'MUSE' : 'CLAUDE';
      paintAnswer(
        line,
        fallback,
        fallback
          ? `CLAIMED — ${provenWho} empty or fallback.`
          : `PROVEN — ${provenWho}`,
      );
    } catch (err) {
      if (gen !== askGen.current) return;
      const msg = err instanceof Error ? err.message : '';
      const timed = /timed out/i.test(msg);
      const net = /network/i.test(msg);
      const spoken = timed ? ERR_TIMEOUT : net ? ERR_NETWORK : BRAIN_SILENT;
      paintAnswer(
        spoken,
        true,
        timed
          ? 'CLAIMED — Brain /chat timed out.'
          : net
            ? 'CLAIMED — Network error.'
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
        <em>{voiceName}</em>
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
      {statusLine ? (
        <p className={`wispr__banner${voice.voiceError ? ' is-warn' : ''}${thinking ? ' is-think' : ''}`} role="status">
          {statusLine}
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
          <i>LIVE</i>
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
          <i>{xaiReady ? 'LIVE' : 'STANDBY'}</i>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={lane === 'muse'}
          className={`wispr__model${lane === 'muse' ? ' is-on' : ''}${museReady ? '' : ' is-off'}`}
          onClick={() => {
            setLane('muse');
            if (!museReady) setBanner(MUSE_OFF);
          }}
        >
          MUSE
          <i>{museReady ? 'LIVE' : 'STANDBY'}</i>
        </button>
      </div>
      {reply ? (
        <div className="wispr__answer" data-testid="jarvis-reply" aria-live="polite">
          <span>JARVIS</span>
          <p>{reply}</p>
        </div>
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
