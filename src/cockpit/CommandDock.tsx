import { useCallback, useEffect, useRef, useState } from 'react';
import { brain } from '../api/brain';
import { useEchoVoice } from '../hooks/useEchoVoice';
import { ApprovalQueuePanel } from '../components/ApprovalQueuePanel';

interface CommandDockProps {
  brainOnline: boolean;
  talking: boolean;
  listening: boolean;
  seed?: string;
  onWispr: () => void;
  onSubmit: (text: string) => void;
  onAnswer: (line: string, claimed: boolean) => void;
  onSpeakEnd: () => void;
  onEnd: () => void;
}

export function CommandDock({
  brainOnline,
  talking,
  listening,
  seed,
  onWispr,
  onSubmit,
  onAnswer,
  onSpeakEnd,
  onEnd,
}: CommandDockProps) {
  const [text, setText] = useState('');
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<string | null>(null);
  const [originalDraft, setOriginalDraft] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const askRef = useRef<(q?: string) => Promise<void>>(async () => {});

  const handleTranscript = useCallback((line: string) => setText(line), []);
  const handleFinal = useCallback((line: string) => {
    setText(line);
    void askRef.current(line);
  }, []);

  const { speak, stopSpeaking, startListening, stopListening, micSupported } = useEchoVoice({
    speakEnabled: true,
    onTranscript: handleTranscript,
    onFinalTranscript: handleFinal,
  });

  useEffect(() => {
    if (!seed) return;
    setText(seed);
    ref.current?.focus();
  }, [seed]);

  const handleAsk = async (raw?: string) => {
    const query = (raw ?? text).trim();
    if (!query) return;
    stopSpeaking();
    onSubmit(query);
    setApprovalId(null);
    setDraftEdit(null);
    setOriginalDraft('');

    if (!brainOnline) {
      onAnswer('Brain silent. No invented numbers, sir.', true);
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
      const claimed = !res.answer;
      onAnswer(spoken || 'Acknowledged, sir.', claimed);
      if (spoken) {
        speak(spoken);
        window.setTimeout(onSpeakEnd, Math.min(9000, 1800 + spoken.length * 40));
      } else {
        onSpeakEnd();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      onAnswer(msg, true);
      speak(msg);
      window.setTimeout(onSpeakEnd, 2400);
    }
  };
  askRef.current = handleAsk;

  return (
    <footer className={`wispr${talking ? ' wispr--talk' : ''}`}>
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
          void handleAsk();
        }}
      >
        <button
          type="button"
          className={`wispr__orb-btn${listening ? ' is-hot' : ''}`}
          aria-pressed={listening}
          onClick={() => {
            onWispr();
            if (!micSupported) return;
            if (listening) stopListening();
            else startListening();
          }}
        >
          WISPR FLOW
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
        {talking ? (
          <button type="button" className="wispr__end" onClick={onEnd}>
            END
          </button>
        ) : null}
      </form>
    </footer>
  );
}
