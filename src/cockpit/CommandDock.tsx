import { useCallback, useEffect, useRef, useState } from 'react';
import { brain } from '../api/brain';
import { useEchoVoice, type EchoVoiceState, type VoiceError } from '../hooks/useEchoVoice';
import { ApprovalQueuePanel } from '../components/ApprovalQueuePanel';

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

  const hear = async (line: string, sink = true) => {
    const result = await voice.speak(line);
    if (result === 'blocked') setBanner(ERR_COPY['tts-blocked']);
    if (result === 'missing') setBanner(ERR_COPY['tts-missing']);
    if (sink) onSpeakEnd();
  };

  const handleAsk = async (raw?: string) => {
    const query = (raw ?? text).trim();
    if (!query) return;
    voice.unlock();
    voice.stopSpeaking();
    onSubmit(query);
    setApprovalId(null);
    setDraftEdit(null);
    setOriginalDraft('');

    if (!brainOnline) {
      const line = 'Brain silent. No invented numbers, sir.';
      setLastSaid(line);
      onAnswer(line, true);
      await hear(line);
      return;
    }

    try {
      const res = await brain.chat({ message: query });
      if (res.draft) {
        setDraftEdit(res.draft);
        setOriginalDraft(res.draft);
      }
      if (res.approval_id) setApprovalId(res.approval_id);
      const spoken = res.answer ?? res.note ?? res.error ?? (res.draft ? 'Draft ready in the queue.' : '');
      const line = spoken || 'Acknowledged, sir.';
      setLastSaid(line);
      onAnswer(line, !res.answer);
      await hear(line);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setLastSaid(msg);
      onAnswer(msg, true);
      await hear(msg);
    }
  };
  askRef.current = handleAsk;

  const onSpeakClick = async () => {
    voice.unlock();
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
      await hear(line, false);
      return;
    }
    if (result === 'missing') {
      setBanner(ERR_COPY['mic-missing']);
      ref.current?.focus();
      const line = 'I cannot hear you. Type the command, sir.';
      setLastSaid(line);
      onAnswer(line, true);
      await hear(line, false);
    }
  };

  const speakLabel =
    voice.voiceState === 'listening'
      ? 'LISTENING'
      : voice.voiceState === 'speaking'
        ? 'SPEAKING'
        : 'SPEAK';

  return (
    <footer className={`wispr${talking ? ' wispr--talk' : ''}`}>
      {banner ? (
        <p className={`wispr__banner${voice.voiceError ? ' is-warn' : ''}`} role="status">
          {banner}
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
          placeholder="Speak when ready, sir…"
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
