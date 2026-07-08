import { useCallback, useEffect, useState } from 'react';
import { brain, type ChatDealFields, type ChatResponse } from '../api/brain';
import { useEchoVoice, type EchoVoiceState } from '../hooks/useEchoVoice';
import { RhinoCore } from './RhinoCore';
import './echo-command.css';

interface EchoCommandProps {
  onVoiceStateChange?: (state: EchoVoiceState) => void;
}

export function EchoCommand({ onVoiceStateChange }: EchoCommandProps) {
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
  const [error, setError] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<string | null>(null);

  const handleTranscript = useCallback((text: string) => {
    setMessage(text);
  }, []);

  const {
    voiceState,
    speak,
    stopSpeaking,
    toggleListening,
    setThinking,
    speechSupported,
    micSupported,
  } = useEchoVoice({ speakEnabled, onTranscript: handleTranscript });

  useEffect(() => {
    onVoiceStateChange?.(loading ? 'thinking' : voiceState);
  }, [voiceState, loading, onVoiceStateChange]);

  const handleAsk = async (text?: string) => {
    const query = (text ?? message).trim();
    if (!query) return;

    setLoading(true);
    setThinking(true);
    setError(null);
    setResponse(null);
    setTaskResult(null);
    setDraftEdit(null);
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
      setThinking(false);
    }
  };

  const updateDeal = (field: keyof ChatDealFields, value: string) => {
    setDeal((d) => ({ ...d, [field]: value === '' ? 0 : Number(value) }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleAsk();
    }
  };

  const displayState: EchoVoiceState = loading ? 'thinking' : voiceState;

  return (
    <section className="echo-command echo-command--hero hud-corners rhino-metal" aria-label="Ask Echo">
      <div className="echo-command__mesh" aria-hidden="true" />
      <div className="echo-command__vignette" aria-hidden="true" />

      <div className="echo-command__hero">
        <div className="echo-command__core-col">
          <RhinoCore
            state={displayState}
            size="hero"
            showParticles
            label="Echo voice core"
          />
        </div>

        <div className="echo-command__main-col">
          <div className="echo-command__head">
            <div>
              <span className="echo-command__kicker">OPERATING BRAIN · ECHO COO</span>
              <h2 className="echo-command__title wordmark-gold">Ask Echo</h2>
              <p className="echo-command__subtitle">
                Rigor over cheerleading — priorities first, browser-first execution.
                Rhino Robot captures meetings · Fieldy feeds the brief.
              </p>
            </div>
            <div className="echo-command__controls">
              {speechSupported && (
                <button
                  type="button"
                  className={`echo-command__toggle${speakEnabled ? ' echo-command__toggle--on' : ''}`}
                  onClick={() => {
                    if (speakEnabled) stopSpeaking();
                    setSpeakEnabled((s) => !s);
                  }}
                  aria-pressed={speakEnabled}
                >
                  {speakEnabled ? 'Voice on' : 'Voice off'}
                </button>
              )}
            </div>
          </div>

          <div className="echo-command__bar">
            <div className="echo-command__input-wrap">
              <textarea
                id="echo-input"
                className="echo-command__input"
                rows={2}
                placeholder="Command the stack — deals, priorities, drafts, Fieldy context…"
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
                  onClick={toggleListening}
                  aria-pressed={voiceState === 'listening'}
                  title={voiceState === 'listening' ? 'Stop listening' : 'Voice input'}
                >
                  <span className="echo-command__btn-icon" aria-hidden="true">◉</span>
                  Mic
                </button>
              )}
              <button
                type="button"
                className="echo-command__btn echo-command__btn--primary"
                disabled={loading || !message.trim()}
                onClick={() => void handleAsk()}
              >
                {loading ? 'Processing' : 'Send'}
              </button>
            </div>
          </div>

          <div className="echo-command__meta">
            <div className="echo-command__hint">
              {micSupported
                ? 'Enter to send · Mic for STT · Echo speaks TTS · Rhino Robot → ClickUp'
                : 'Enter to send · Voice input not supported in this browser'}
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
          {taskResult && <div className="echo-command__response">{taskResult}</div>}
          {response && (
            <>
              {response.note && (
                <div className="feed-result" style={{ marginBottom: 10 }}>
                  <em>{response.note}</em>
                  {response.mode && (
                    <span style={{ color: 'var(--faint)' }}> (mode: {response.mode})</span>
                  )}
                </div>
              )}
              {response.error && (
                <div className="feed-result diverged">{response.error}</div>
              )}
              {response.answer && (
                <div className="echo-command__response">{response.answer}</div>
              )}
              {(response.draft || draftEdit) && (
                <div className="approval-queue" style={{ marginTop: 12 }}>
                  <h4>Approval Queue</h4>
                  <textarea
                    className="feed-textarea"
                    style={{ minHeight: 100 }}
                    value={draftEdit ?? response.draft ?? ''}
                    onChange={(e) => setDraftEdit(e.target.value)}
                  />
                  <div className="approval-btns">
                    <button type="button" className="approve" disabled title="Coming soon">
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftEdit(response.draft ?? '')}
                    >
                      Reset edit
                    </button>
                    <button type="button" className="deny" disabled title="Coming soon">
                      Deny
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
