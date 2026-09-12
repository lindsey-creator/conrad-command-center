import { useCallback, useEffect, useRef, useState } from 'react';
import { brain, type ChatResponse } from '../api/brain';
import { useEchoVoice, type EchoVoiceState } from '../hooks/useEchoVoice';
import { ApprovalQueuePanel } from '../components/ApprovalQueuePanel';
import { PendingApprovals } from '../components/PendingApprovals';

interface CommandDockProps {
  brainOnline: boolean;
  commandSeed?: string;
  onVoiceStateChange?: (state: EchoVoiceState) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function CommandDock({
  brainOnline,
  commandSeed,
  onVoiceStateChange,
  onLoadingChange,
}: CommandDockProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<string | null>(null);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const askRef = useRef<(text?: string) => Promise<void>>(async () => {});

  const handleTranscript = useCallback((text: string) => setMessage(text), []);
  const handleFinal = useCallback((text: string) => {
    setMessage(text);
    void askRef.current(text);
  }, []);

  const { voiceState, speak, stopSpeaking, startListening, stopListening, speechSupported, micSupported } =
    useEchoVoice({
      speakEnabled,
      onTranscript: handleTranscript,
      onFinalTranscript: handleFinal,
    });

  const displayState: EchoVoiceState = loading ? 'thinking' : voiceState;

  useEffect(() => {
    onVoiceStateChange?.(displayState);
  }, [displayState, onVoiceStateChange]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    if (!commandSeed) return;
    setMessage(commandSeed);
    inputRef.current?.focus();
  }, [commandSeed]);

  const handleAsk = async (text?: string) => {
    const query = (text ?? message).trim();
    if (!query || !brainOnline) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    setApprovalId(null);
    setDraftEdit(null);
    stopSpeaking();
    try {
      const res = await brain.chat({ message: query });
      setResponse(res);
      if (res.draft) setDraftEdit(res.draft);
      if (res.approval_id) setApprovalId(res.approval_id);
      const spoken = res.answer ?? res.note ?? res.error ?? (res.draft ? 'Draft ready in the queue.' : null);
      if (spoken) speak(spoken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
      speak(msg);
    } finally {
      setLoading(false);
    }
  };
  askRef.current = handleAsk;

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleAsk();
    }
  };

  return (
    <footer className="command-dock">
      {(error || response) && (
        <div className="command-dock__reply" role="status">
          {error && <p className="command-dock__err">{error}</p>}
          {response?.answer && <p className="command-dock__answer">{response.answer}</p>}
          {response?.note && !response.answer && <p className="command-dock__answer">{response.note}</p>}
          {(response?.draft || draftEdit) && (
            <ApprovalQueuePanel
              approvalId={approvalId}
              draft={draftEdit ?? response?.draft ?? ''}
              originalDraft={response?.draft ?? ''}
              onDraftChange={setDraftEdit}
              onResolved={() => {
                setApprovalId(null);
                setDraftEdit(null);
              }}
            />
          )}
        </div>
      )}
      <PendingApprovals />
      <div className="command-dock__bar">
        <button
          type="button"
          className={`command-dock__speak${voiceState === 'listening' ? ' is-hot' : ''}`}
          onClick={() => inputRef.current?.focus()}
          onPointerDown={(e) => {
            if (!micSupported) return;
            e.preventDefault();
            if (voiceState !== 'listening') startListening();
          }}
          onPointerUp={() => {
            if (voiceState === 'listening') stopListening();
          }}
          onPointerLeave={() => {
            if (voiceState === 'listening') stopListening();
          }}
        >
          SPEAK
        </button>
        <label className="command-dock__sr" htmlFor="jarvis-command-input">
          Command
        </label>
        <textarea
          id="jarvis-command-input"
          ref={inputRef}
          className="command-dock__input"
          rows={1}
          placeholder="Speak when ready, sir…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {speechSupported && (
          <button
            type="button"
            className={`command-dock__mute${speakEnabled ? ' is-on' : ''}`}
            onClick={() => {
              if (speakEnabled) stopSpeaking();
              setSpeakEnabled((s) => !s);
            }}
            aria-pressed={speakEnabled}
          >
            {speakEnabled ? 'VOICE' : 'MUTE'}
          </button>
        )}
        <button
          type="button"
          className="command-dock__exec"
          disabled={loading || !message.trim() || !brainOnline}
          onClick={() => void handleAsk()}
        >
          {loading ? 'THINKING' : 'EXECUTE'}
        </button>
      </div>
    </footer>
  );
}
