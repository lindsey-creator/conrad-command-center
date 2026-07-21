import { useCallback, useEffect, useRef, useState } from 'react';
import { brain, type ChatDealFields, type ChatResponse } from '../api/brain';
import { useEchoVoice, type EchoVoiceState } from '../hooks/useEchoVoice';
import { ApprovalQueuePanel } from './ApprovalQueuePanel';
import { LiveCore } from './LiveCore';
import './echo-command.css';

interface EchoCommandProps {
  brainOnline?: boolean;
  onVoiceStateChange?: (state: EchoVoiceState) => void;
  /** Prefill from Jarvis quick actions / deal cards */
  injectMessage?: string | null;
  onInjectMessageConsumed?: () => void;
}

function voiceStatusLabel(state: EchoVoiceState): string | null {
  switch (state) {
    case 'listening':
      return 'Listening…';
    case 'speaking':
      return 'Echo is speaking…';
    case 'thinking':
      return 'Echo is thinking…';
    default:
      return null;
  }
}

export function EchoCommand({
  brainOnline = false,
  onVoiceStateChange,
  injectMessage = null,
  onInjectMessageConsumed,
}: EchoCommandProps) {
  const [message, setMessage] = useState('');
  const [wantsDraft, setWantsDraft] = useState(false);
  const [wantsTask, setWantsTask] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [showDeal, setShowDeal] = useState(false);
  const [deal, setDeal] = useState<ChatDealFields>({
    purchase_price: 0,
    rehab_estimate: 0,
    arv: 0,
    monthly_rent: 0,
    monthly_debt_service: 0,
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [taskResult, setTaskResult] = useState<string | null>(null);
  const [taskApprovalId, setTaskApprovalId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<string | null>(null);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const handleAskRef = useRef<(text?: string) => Promise<void>>(async () => {});

  const handleTranscript = useCallback((text: string) => {
    setMessage(text);
  }, []);

  const handleFinalTranscript = useCallback((text: string) => {
    setMessage(text);
    void handleAskRef.current(text);
  }, []);

  const {
    voiceState,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    speechSupported,
    micSupported,
  } = useEchoVoice({
    speakEnabled,
    onTranscript: handleTranscript,
    onFinalTranscript: handleFinalTranscript,
  });

  const displayState: EchoVoiceState = loading ? 'thinking' : voiceState;
  const statusLabel = voiceStatusLabel(displayState);

  useEffect(() => {
    onVoiceStateChange?.(displayState);
  }, [displayState, onVoiceStateChange]);

  useEffect(() => {
    if (!injectMessage?.trim()) return;
    setMessage(injectMessage.trim());
    onInjectMessageConsumed?.();
    const el = document.getElementById('echo-input');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (el as HTMLTextAreaElement | null)?.focus();
  }, [injectMessage, onInjectMessageConsumed]);

  const handleAsk = async (text?: string) => {
    const query = (text ?? message).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setTaskResult(null);
    setTaskApprovalId(null);
    setTaskDraft('');
    setDraftEdit(null);
    setApprovalId(null);
    stopSpeaking();

    try {
      if (wantsTask) {
        const taskRes = await brain.issueTask({
          text: query,
          source: 'echo_command',
        });
        if (taskRes.status === 'connect_source') {
          const msg = 'ClickUp not connected — add keys in Connections.';
          setError(msg);
          speak(msg);
          return;
        }
        if (taskRes.error) {
          setError(taskRes.error);
          speak(taskRes.error);
          return;
        }
        if (taskRes.approval_id) {
          setTaskApprovalId(taskRes.approval_id);
          setTaskDraft(query);
          const summary = 'Task queued — approve below to create in ClickUp.';
          setTaskResult(summary);
          speak(summary);
          return;
        }
        const summary = taskRes.requires_approval
          ? `Task queued for your approval${taskRes.routed_to ? ` — routed to ${taskRes.routed_to}` : ''}.`
          : `Task routed to ClickUp${taskRes.routed_to ? ` for ${taskRes.routed_to}` : ''}.`;
        setTaskResult(summary);
        speak(summary);
        return;
      }

      const hasDeal =
        showDeal &&
        (deal.purchase_price > 0 || deal.arv > 0 || deal.rehab_estimate > 0);
      const res = await brain.chat({
        message: query,
        wants_draft: wantsDraft,
        deal: hasDeal ? deal : undefined,
      });
      setResponse(res);
      if (res.draft) setDraftEdit(res.draft);
      if (res.approval_id) setApprovalId(res.approval_id);

      const spoken =
        res.answer ??
        res.note ??
        res.error ??
        (res.draft ? 'Draft ready for your review in the approval queue.' : null);
      if (spoken) speak(spoken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
      speak(msg);
    } finally {
      setLoading(false);
    }
  };

  handleAskRef.current = handleAsk;

  const updateDeal = (field: keyof ChatDealFields, value: string) => {
    setDeal((d) => ({ ...d, [field]: value === '' ? 0 : Number(value) }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleAsk();
    }
  };

  const onMicPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (voiceState !== 'listening') startListening();
  };

  const onMicPointerUp = () => {
    if (voiceState === 'listening') stopListening();
  };

  return (
    <section
      className="echo-command echo-command--hero hud-corners jarvis-glass"
      aria-label="Jarvis command interface"
      id="jarvis-console"
    >
      <div className="echo-command__mesh" aria-hidden="true" />
      <div className="echo-command__hero">
        <div className="echo-command__core-col">
          <LiveCore
            state={displayState}
            size="hero"
            showParticles
            online={brainOnline}
            label={statusLabel ?? (brainOnline ? 'Echo live' : 'Echo standby')}
          />
        </div>

        <div className="echo-command__main-col">
          <div className="echo-command__head">
            <div>
              <span className="echo-command__kicker">Jarvis · Echo COO · Operating Brain</span>
              <h2 className="echo-command__title">Command Interface</h2>
              <p className="echo-command__subtitle">
                Run the empire from here — voice or text, deal math, drafts, tasks, and briefs with
                full Brain context.
              </p>
            </div>
            <div className="echo-command__controls">
              {speechSupported && (
                <button
                  type="button"
                  className={`echo-command__toggle echo-command__toggle--speaker${speakEnabled ? ' echo-command__toggle--on' : ''}`}
                  onClick={() => {
                    if (speakEnabled) stopSpeaking();
                    setSpeakEnabled((s) => !s);
                  }}
                  aria-pressed={speakEnabled}
                  title={speakEnabled ? 'Mute Echo voice' : 'Enable Echo voice'}
                >
                  <span className="echo-command__toggle-icon" aria-hidden="true">
                    {speakEnabled ? '🔊' : '🔇'}
                  </span>
                  {speakEnabled ? 'Speak on' : 'Speak off'}
                </button>
              )}
            </div>
          </div>

          {statusLabel && (
            <div
              className={`echo-command__voice-status echo-command__voice-status--${displayState}`}
              role="status"
              aria-live="polite"
            >
              {statusLabel}
            </div>
          )}

          <div className="echo-command__bar">
            <div className="echo-command__input-wrap">
              <textarea
                id="echo-input"
                className="echo-command__input"
                rows={2}
                placeholder="Ask about deals, priorities, or today's brief…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Message for Echo"
              />
            </div>
            <div className="echo-command__actions">
              {micSupported && (
                <button
                  type="button"
                  className={`echo-command__btn echo-command__btn--mic${voiceState === 'listening' ? ' echo-command__btn--active' : ''}`}
                  onPointerDown={onMicPointerDown}
                  onPointerUp={onMicPointerUp}
                  onPointerLeave={onMicPointerUp}
                  onPointerCancel={onMicPointerUp}
                  aria-pressed={voiceState === 'listening'}
                  title={voiceState === 'listening' ? 'Release to stop' : 'Hold to speak'}
                >
                  <span className="echo-command__btn-icon" aria-hidden="true">🎙</span>
                  Mic
                </button>
              )}
              <button
                type="button"
                className="echo-command__btn echo-command__btn--primary"
                disabled={loading || !message.trim()}
                onClick={() => void handleAsk()}
              >
                {loading ? 'Thinking…' : 'Send'}
              </button>
            </div>
          </div>

          <div className="echo-command__meta">
            <div className="echo-command__hint">
              {micSupported
                ? 'Hold mic or type · Enter to send'
                : 'Type your question · Enter to send'}
            </div>
            <div className="echo-command__options">
              <label className="echo-command__checkbox">
                <input
                  type="checkbox"
                  checked={wantsTask}
                  onChange={(e) => {
                    setWantsTask(e.target.checked);
                    if (e.target.checked) setWantsDraft(false);
                  }}
                />
                Route → ClickUp task
              </label>
              <label className="echo-command__checkbox">
                <input
                  type="checkbox"
                  checked={wantsDraft}
                  onChange={(e) => {
                    setWantsDraft(e.target.checked);
                    if (e.target.checked) setWantsTask(false);
                  }}
                />
                Draft → Approval Queue
              </label>
              <button
                type="button"
                className="deal-toggle"
                onClick={() => setShowDeal((s) => !s)}
              >
                {showDeal ? '− Deal fields' : '+ Deal numbers'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeal && (
        <div className="echo-command__deal feed-grid">
          <div>
            <label className="feed-label">Purchase price</label>
            <input
              className="feed-input"
              type="number"
              value={deal.purchase_price || ''}
              onChange={(e) => updateDeal('purchase_price', e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">ARV</label>
            <input
              className="feed-input"
              type="number"
              value={deal.arv || ''}
              onChange={(e) => updateDeal('arv', e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">Rehab</label>
            <input
              className="feed-input"
              type="number"
              value={deal.rehab_estimate || ''}
              onChange={(e) => updateDeal('rehab_estimate', e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">Monthly rent</label>
            <input
              className="feed-input"
              type="number"
              value={deal.monthly_rent || ''}
              onChange={(e) => updateDeal('monthly_rent', e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">Monthly debt service</label>
            <input
              className="feed-input"
              type="number"
              value={deal.monthly_debt_service || ''}
              onChange={(e) => updateDeal('monthly_debt_service', e.target.value)}
            />
          </div>
        </div>
      )}

      {(error || response || taskResult) && (
        <div className="echo-command__panel echo-command__panel--slide">
          {error && <div className="feed-result diverged">{error}</div>}
          {taskResult && !taskApprovalId && (
            <div className="echo-command__response">{taskResult}</div>
          )}
          {taskApprovalId && (
            <ApprovalQueuePanel
              approvalId={taskApprovalId}
              draft={taskDraft}
              originalDraft={taskDraft}
              onDraftChange={setTaskDraft}
              onResolved={() => {
                setTaskApprovalId(null);
                setTaskDraft('');
                setTaskResult(null);
              }}
            />
          )}
          {response && (
            <>
              {response.note && (
                <div className="echo-command__mode-note">
                  <em>{response.note}</em>
                  {response.mode && (
                    <span className="echo-command__mode-tag">mode: {response.mode}</span>
                  )}
                </div>
              )}
              {response.error && (
                <div className="feed-result diverged">{response.error}</div>
              )}
              {response.answer && (
                <div className="echo-command__response">{response.answer}</div>
              )}
              {response.council_seats && response.council_seats.length > 0 && (
                <div className="echo-command__mode-note">
                  <span className="echo-command__mode-tag">
                    Council:{' '}
                    {response.council_seats
                      .map((s) => s.replace(/_/g, ' '))
                      .join(' · ')}
                  </span>
                </div>
              )}
              {(response.draft || draftEdit) && (
                <ApprovalQueuePanel
                  approvalId={approvalId}
                  draft={draftEdit ?? response.draft ?? ''}
                  originalDraft={response.draft ?? ''}
                  onDraftChange={setDraftEdit}
                  onResolved={() => {
                    setApprovalId(null);
                    setDraftEdit(null);
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
