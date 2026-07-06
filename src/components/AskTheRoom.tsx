import { useState } from 'react';
import { brain, type ChatDealFields, type ChatResponse } from '../api/brain';

export function AskTheRoom() {
  const [message, setMessage] = useState('');
  const [wantsDraft, setWantsDraft] = useState(false);
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
  const [error, setError] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    setDraftEdit(null);
    try {
      const hasDeal =
        showDeal &&
        (deal.purchase_price > 0 || deal.arv > 0 || deal.rehab_estimate > 0);
      const res = await brain.chat({
        message: message.trim(),
        wants_draft: wantsDraft,
        deal: hasDeal ? deal : undefined,
      });
      setResponse(res);
      if (res.draft) setDraftEdit(res.draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const updateDeal = (field: keyof ChatDealFields, value: string) => {
    setDeal((d) => ({ ...d, [field]: value === '' ? 0 : Number(value) }));
  };

  return (
    <section className="ask-room">
      <h3>Ask the room</h3>
      <p className="sub">
        Talk to the Brain. Numbers come from the engine — it narrates, never
        computes. Drafts go to the Approval Queue.
      </p>

      <label className="feed-label" htmlFor="ask-message">
        Your question
      </label>
      <textarea
        id="ask-message"
        className="feed-textarea"
        style={{ minHeight: 80 }}
        placeholder="What should I do on Ridgeline? Draft a follow-up to Aaron?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: 'var(--muted)' }}>
        <input
          type="checkbox"
          checked={wantsDraft}
          onChange={(e) => setWantsDraft(e.target.checked)}
        />
        Request a draft (routes to Approval Queue)
      </label>

      <button
        type="button"
        className="deal-toggle"
        onClick={() => setShowDeal((s) => !s)}
      >
        {showDeal ? '− Hide optional deal fields' : '+ Include deal numbers (engine narrates)'}
      </button>

      {showDeal && (
        <div className="feed-grid">
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

      <div className="feed-actions">
        <button
          type="button"
          className="feed-btn"
          disabled={loading || !message.trim()}
          onClick={() => void handleAsk()}
        >
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      {error && <div className="feed-result diverged">{error}</div>}

      {response && (
        <>
          {response.note && (
            <div className="feed-result" style={{ marginTop: 12 }}>
              <em>{response.note}</em>
              {response.mode && (
                <>
                  {' '}
                  <span style={{ color: 'var(--faint)' }}>(mode: {response.mode})</span>
                </>
              )}
            </div>
          )}
          {response.error && (
            <div className="feed-result diverged">{response.error}</div>
          )}
          {response.answer && (
            <div className="ask-answer">{response.answer}</div>
          )}
          {(response.draft || draftEdit) && (
            <div className="approval-queue">
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
    </section>
  );
}
