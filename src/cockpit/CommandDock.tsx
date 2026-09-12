import { useCallback, useEffect, useRef, useState } from 'react';
import { brain } from '../api/brain';
import { useEchoVoice, type EchoVoiceState, type VoiceError } from '../hooks/useEchoVoice';
import { ApprovalQueuePanel } from '../components/ApprovalQueuePanel';
import { COMMANDS, needsConfirm } from './commands';
import { BRAIN_SILENT, jarvisSpokenLine } from './talkReply';

const ERR_COPY: Record<Exclude<VoiceError, null>, string> = {
  'mic-denied': 'MIC BLOCKED — allow the microphone, or type and GO. JARVIS still speaks.',
  'mic-missing': 'NO MIC ENGINE — type and GO. TTS still works in this browser.',
  'rec-failed': 'LISTEN FAILED — type the command. SPEAK still talks back.',
  'tts-missing': 'NO TTS in this browser — captions still run.',
  'tts-blocked': 'TTS BLOCKED — click SPEAK once to unlock voice, then GO again.',
};

interface CommandDockProps {
  brainOnline: boolean;
  talking: boolean;
  listening: boolean;
  seed?: string;
  demoSpeak?: boolean;
  onWispr: () => void;
  onSubmit: (text: string) => void;
  onAnswer: (line: string, claimed: boolean) => void;
  onSpeakEnd: () => void;
  onEnd: () => void;
  onVoiceState?: (state: EchoVoiceState) => void;
}

export function CommandDock({
  brainOnline,
  talking,
  listening,
  seed,
  demoSpeak = false,
  onWispr,
  onSubmit,
  onAnswer,
  onSpeakEnd,
  onEnd,
  onVoiceState,
}: CommandDockProps) {
  const [text, setText] = useState('');
  const [lastSaid, setLastSaid] = useState('');
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<string | null>(null);
  const [originalDraft, setOriginalDraft] = useState('');
  const [banner, setBanner] = useState(demoSpeak ? 'CLICK SPEAK — hear JARVIS, then talk or type.' : '');
  const [pending, setPending] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [thinking, setThinking] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const askRef = useRef<(q?: string) => Promise<void>>(async () => {});

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
  });

  useEffect(() => {
    if (!seed) return;
    setText(seed);
    ref.current?.focus();
  }, [seed]);

  useEffect(() => {
    if (voice.voiceError) setBanner(ERR_COPY[voice.voiceError]);
  }, [voice.voiceError]);

  const hear = async (line: string, sink = false) => {
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
    if (!query) return;
    voice.unlock();
    if (!trusted && needsConfirm(query)) {
      setPending(query);
      setBanner('CONFIRM on glass — nothing executes yet.');
      return;
    }
    setPending(null);
    voice.stopSpeaking();
    setText(query);
    setReply('');
    setThinking(true);
    setBanner(brainOnline ? 'THINKING — Brain /chat' : 'THINKING — Brain /chat (health standby)');
    voice.setThinking(true);
    onSubmit(query);
    setApprovalId(null);
    setDraftEdit(null);
    setOriginalDraft('');

    try {
      const res = await brain.chat({ message: query });
      if (res.draft) {
        setDraftEdit(res.draft);
        setOriginalDraft(res.draft);
      }
      if (res.approval_id) setApprovalId(res.approval_id);
      const { line, fallback } = jarvisSpokenLine(res);
      await deliver(
        line,
        fallback,
        fallback
          ? 'CLAIMED — ANTHROPIC_API_KEY unset on jarvis-brain.'
          : 'PROVEN — Brain /chat',
      );
    } catch {
      await deliver(BRAIN_SILENT, true, 'CLAIMED — Brain /chat did not respond.');
    }
  };
  askRef.current = handleAsk;

  const onSpeakClick = async () => {
    voice.unlock();
    if (voice.voiceState === 'speaking') {
      voice.stopSpeaking();
      onWispr();
      const barged = await voice.startListening();
      if (barged === 'denied' || barged === 'missing') {
        setBanner(ERR_COPY[barged === 'denied' ? 'mic-denied' : 'mic-missing']);
        onVoiceState?.('error');
      }
      return;
    }
    if (demoSpeak && !text.trim() && !listening) {
      const line = 'JARVIS online, sir.';
      setLastSaid(line);
      onAnswer(line, true);
      onWispr();
      await hear(line, false);
      return;
    }
    if (voice.voiceState === 'listening') {
      voice.stopListening();
      return;
    }
    onWispr();
    const result = await voice.startListening();
    if (result === 'denied') {
      setBanner(ERR_COPY['mic-denied']);
      const line = 'Microphone blocked. Type the command, sir.';
      setLastSaid(line);
      onAnswer(line, true);
      onVoiceState?.('error');
      await hear(line, false);
      return;
    }
    if (result === 'missing') {
      setBanner(ERR_COPY['mic-missing']);
      ref.current?.focus();
      const line = 'I cannot hear you. Type the command, sir.';
      setLastSaid(line);
      onAnswer(line, true);
      onVoiceState?.('error');
      await hear(line, false);
    }
  };

  const speakLabel =
    voice.voiceState === 'listening'
      ? 'LISTENING'
      : voice.voiceState === 'speaking'
        ? 'SPEAKING'
        : voice.voiceState === 'thinking'
          ? 'THINKING'
          : voice.voiceState === 'error'
            ? 'ERROR'
            : 'SPEAK';

  return (
    <footer className={`wispr${talking ? ' wispr--talk' : ''} wispr--${voice.voiceState}`} data-wispr={voice.voiceState}>
      <p className={`wispr__state is-${voice.voiceState}`} aria-live="polite">
        {speakLabel === 'SPEAK' ? 'IDLE' : speakLabel}
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
      {banner ? (
        <p className={`wispr__banner${voice.voiceError || thinking ? ' is-warn' : ''}`} role="status">
          {banner}
        </p>
      ) : null}
      {reply ? (
        <p className="wispr__reply" data-testid="jarvis-reply" aria-live="polite">
          {reply}
        </p>
      ) : thinking ? (
        <p className="wispr__reply wispr__reply--think" data-testid="jarvis-thinking">
          Thinking.
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
          className={`wispr__speak${listening || voice.voiceState === 'listening' ? ' is-hot' : ''}${voice.voiceState === 'speaking' ? ' is-say' : ''}`}
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
          placeholder="Direct the agent, sir — Auto vs GO…"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="wispr__go">
          GO
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
