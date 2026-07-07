import { useCallback, useEffect, useRef, useState } from 'react';
import {
  brain,
  type ClickUpIngestResult,
  type ClickUpSyncStatus,
  type DealDecisionResult,
  type ShadowValidationResult,
  type TrainCounts,
  type VoiceTrainResult,
} from '../api/brain';
import { csvRowsToDeals, parseCsv } from '../utils/csv';

interface VoiceLineResult extends VoiceTrainResult {
  text: string;
  error?: string;
}

export function FeedTheBrain() {
  // Voice
  const [voiceText, setVoiceText] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResults, setVoiceResults] = useState<VoiceLineResult[] | null>(null);

  // Deal decision
  const [address, setAddress] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [arv, setArv] = useState('');
  const [rehab, setRehab] = useState('');
  const [rent, setRent] = useState('');
  const [debtService, setDebtService] = useState('');
  const [verdict, setVerdict] = useState('GO');
  const [why, setWhy] = useState('');
  const [dealLoading, setDealLoading] = useState(false);
  const [dealResult, setDealResult] = useState<DealDecisionResult | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);

  // Shadow
  const [shadowLoading, setShadowLoading] = useState(false);
  const [shadowResult, setShadowResult] = useState<ShadowValidationResult | null>(null);
  const [shadowError, setShadowError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [counts, setCounts] = useState<TrainCounts | null>(null);
  const [clickUpStatus, setClickUpStatus] = useState<ClickUpSyncStatus | null>(null);
  const [clickUpLoading, setClickUpLoading] = useState(false);
  const [clickUpResult, setClickUpResult] = useState<ClickUpIngestResult | null>(null);
  const [clickUpError, setClickUpError] = useState<string | null>(null);

  const refreshMemory = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([
        brain.trainCounts(),
        brain.clickUpSyncStatus(),
      ]);
      setCounts(c);
      setClickUpStatus(s);
    } catch {
      /* Brain offline — cards still render */
    }
  }, []);

  useEffect(() => {
    void refreshMemory();
  }, [refreshMemory]);

  const syncClickUp = async () => {
    setClickUpLoading(true);
    setClickUpError(null);
    setClickUpResult(null);
    try {
      const r = await brain.syncClickUp();
      setClickUpResult(r);
      await refreshMemory();
    } catch (e) {
      setClickUpError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setClickUpLoading(false);
    }
  };

  const saveVoice = async () => {
    const lines = voiceText
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;
    setVoiceLoading(true);
    setVoiceResults(null);
    const results: VoiceLineResult[] = [];
    for (const text of lines) {
      try {
        const r = await brain.trainVoice(text);
        results.push({ ...r, text });
      } catch (e) {
        results.push({
          id: '',
          recipient: '',
          context: '',
          classify_method: '',
          text,
          error: e instanceof Error ? e.message : 'Failed',
        });
      }
    }
    setVoiceResults(results);
    setVoiceLoading(false);
  };

  const saveDeal = async () => {
    setDealLoading(true);
    setDealError(null);
    setDealResult(null);
    try {
      const r = await brain.trainDealDecision({
        address,
        purchase_price: Number(purchasePrice) || 0,
        arv: Number(arv) || 0,
        rehab_estimate: Number(rehab) || 0,
        monthly_rent: Number(rent) || 0,
        monthly_debt_service: Number(debtService) || 0,
        verdict,
        reasoning: why,
      });
      setDealResult(r);
    } catch (e) {
      setDealError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setDealLoading(false);
    }
  };

  const runShadow = async () => {
    setShadowLoading(true);
    setShadowError(null);
    setShadowResult(null);
    try {
      const r = await brain.validationShadow();
      setShadowResult(r);
    } catch (e) {
      setShadowError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setShadowLoading(false);
    }
  };

  const uploadCsv = async (file: File) => {
    setShadowLoading(true);
    setShadowError(null);
    setShadowResult(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const deals = csvRowsToDeals(rows);
      if (!deals.length) throw new Error('No deal rows found in CSV');
      const r = await brain.validationShadowBatch(deals);
      setShadowResult(r);
    } catch (e) {
      setShadowError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setShadowLoading(false);
    }
  };

  const renderShadow = (r: ShadowValidationResult) => (
    <div className={`feed-result${r.divergences.length ? ' diverged' : ' match'}`}>
      <div className="rate">
        {r.match_rate !== null ? `${(r.match_rate * 100).toFixed(1)}%` : '—'} match
      </div>
      <p>
        <strong>{r.matches}</strong> of <strong>{r.n}</strong> decisions agree with
        your rules.
      </p>
      <p>
        <strong>Readiness:</strong> {r.verdict}
      </p>
      {r.divergences.length > 0 && (
        <>
          <p style={{ marginTop: 10 }}>
            <strong>Divergences (your call vs rules):</strong>
          </p>
          {r.divergences.map((d, i) => (
            <div className="divergence-row" key={i}>
              <strong>{d.address || '(no address)'}</strong>
              <br />
              You: <span style={{ color: 'var(--ink)' }}>{d.human_verdict}</span> ·
              Rules: <span style={{ color: 'var(--gold-2)' }}>{d.rules_verdict}</span>
              {d.reasoning && (
                <>
                  <br />
                  <span style={{ color: 'var(--faint)' }}>{d.reasoning}</span>
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div>
      <section className="feed-section">
        <h3>ClickUp → Brain memory</h3>
        <p className="sub">
          Pulls your whole ClickUp workspace — tasks, docs, comments, and meeting
          transcripts (Plaud / Fieldy lists) — into the Brain. Deal decisions route
          to <strong>decisions</strong>; playbooks to <strong>knowledge</strong>;
          templates to <strong>voice</strong>; daily audio transcripts to{' '}
          <strong>conversation_patterns</strong>. Re-syncs automatically every 15
          minutes when connected.
        </p>
        {counts && (
          <p className="feed-hint">
            Memory: {counts.decisions} decisions · {counts.knowledge} knowledge ·{' '}
            {counts.voice} voice · {counts.conversation_patterns} conversations
          </p>
        )}
        {clickUpStatus && !clickUpStatus.configured && (
          <p className="feed-hint">
            Add <code>CLICKUP_API_TOKEN</code> to <code>goldfront-os/.env</code>{' '}
            (Settings → Apps in ClickUp), then restart the Brain.
          </p>
        )}
        <div className="feed-actions">
          <button
            type="button"
            className="feed-btn primary"
            onClick={() => void syncClickUp()}
            disabled={clickUpLoading}
          >
            {clickUpLoading ? 'Syncing…' : 'Sync ClickUp now'}
          </button>
        </div>
        {clickUpError && <p className="feed-error">{clickUpError}</p>}
        {clickUpResult && !clickUpResult.skipped && (
          <div className="feed-result match">
            <p>
              Ingested <strong>{clickUpResult.ingested ?? 0}</strong> items from{' '}
              <strong>{clickUpResult.records_fetched ?? '—'}</strong> records (
              {clickUpResult.tasks_fetched ?? '—'} tasks
              {(clickUpResult.transcripts_fetched ?? 0) > 0 && (
                <>
                  , <strong>{clickUpResult.transcripts_fetched}</strong> transcripts
                </>
              )}
              ).
            </p>
            {clickUpResult.by_collection && (
              <p className="feed-hint">
                {Object.entries(clickUpResult.by_collection)
                  .filter(([, n]) => n > 0)
                  .map(([k, n]) => `${k}: ${n}`)
                  .join(' · ')}
                {(clickUpResult.duplicated ?? 0) > 0 &&
                  ` · ${clickUpResult.duplicated} already in memory`}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="feed-section">
        <h3>Voice</h3>
        <p className="sub">
          Paste your real messages, one per line. Each line trains how you write
          and speak.
        </p>
        <label className="feed-label" htmlFor="voice-text">
          Paste your real messages, one per line
        </label>
        <textarea
          id="voice-text"
          className="feed-textarea"
          placeholder="Hey Aaron — loop Baker on comps before you quote margin.&#10;Ken, can we get Joe's stack on this one by Thursday?"
          value={voiceText}
          onChange={(e) => setVoiceText(e.target.value)}
        />
        <div className="feed-actions">
          <button
            type="button"
            className="feed-btn"
            disabled={voiceLoading || !voiceText.trim()}
            onClick={() => void saveVoice()}
          >
            {voiceLoading ? 'Saving…' : 'Save'}
          </button>
        </div>
        {voiceResults && (
          <div className="feed-result">
            <strong>{voiceResults.filter((r) => !r.error).length}</strong> of{' '}
            <strong>{voiceResults.length}</strong> lines saved.
            {voiceResults.map((r, i) => (
              <div className="voice-line" key={i}>
                {r.error ? (
                  <span style={{ color: 'var(--crit)' }}>
                    ✕ {r.text.slice(0, 60)}… — {r.error}
                  </span>
                ) : (
                  <>
                    <span style={{ color: 'var(--ink)' }}>
                      {r.text.slice(0, 80)}
                      {r.text.length > 80 ? '…' : ''}
                    </span>
                    <br />
                    <span style={{ color: 'var(--faint)' }}>
                      → {r.recipient} · {r.context}
                      {r.classify_method !== 'provided' && ` (${r.classify_method})`}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="feed-section">
        <h3>Deal decision</h3>
        <p className="sub">
          Train a GO / NO-GO / CONDITIONAL with your reasoning. The engine runs in
          parallel and flags when your gut breaks your own rules.
        </p>
        <label className="feed-label">Address</label>
        <input
          className="feed-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Maple, Akron"
        />
        <div className="feed-grid">
          <div>
            <label className="feed-label">Purchase price</label>
            <input
              className="feed-input"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">ARV</label>
            <input
              className="feed-input"
              type="number"
              value={arv}
              onChange={(e) => setArv(e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">Rehab estimate</label>
            <input
              className="feed-input"
              type="number"
              value={rehab}
              onChange={(e) => setRehab(e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">Monthly rent</label>
            <input
              className="feed-input"
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">Monthly debt service</label>
            <input
              className="feed-input"
              type="number"
              value={debtService}
              onChange={(e) => setDebtService(e.target.value)}
            />
          </div>
          <div>
            <label className="feed-label">Verdict</label>
            <select
              className="feed-select"
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
            >
              <option value="GO">GO</option>
              <option value="NO-GO">NO-GO</option>
              <option value="CONDITIONAL">CONDITIONAL</option>
            </select>
          </div>
        </div>
        <label className="feed-label">Why</label>
        <textarea
          className="feed-textarea"
          style={{ minHeight: 80 }}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="Baker loves the comps; DSCR is clean and it opens the flywheel."
        />
        <div className="feed-actions">
          <button
            type="button"
            className="feed-btn"
            disabled={dealLoading || !address.trim()}
            onClick={() => void saveDeal()}
          >
            {dealLoading ? 'Training…' : 'Train decision'}
          </button>
        </div>
        {dealError && <div className="feed-result diverged">{dealError}</div>}
        {dealResult && (
          <div
            className={`feed-result${dealResult.diverged ? ' diverged' : ' match'}`}
          >
            <p>
              <strong>Your call:</strong> {dealResult.verdict} ·{' '}
              <strong>Rules:</strong> {dealResult.rules_verdict}
              {dealResult.diverged && (
                <span style={{ color: 'var(--crit)' }}> · DIVERGED</span>
              )}
            </p>
            <p>{dealResult.divergence_note}</p>
            <p style={{ color: 'var(--faint)', fontSize: 11 }}>
              Stored as decision {dealResult.id.slice(0, 8)}…
            </p>
          </div>
        )}
      </section>

      <section className="feed-section">
        <h3>Shadow validation</h3>
        <p className="sub">
          Does the Brain match your real calls? Run against stored decisions or
          upload a CSV of past deals (dry-run, nothing stored).
        </p>
        <div className="feed-actions">
          <button
            type="button"
            className="feed-btn"
            disabled={shadowLoading}
            onClick={() => void runShadow()}
          >
            {shadowLoading ? 'Running…' : 'Validate stored history'}
          </button>
          <button
            type="button"
            className="feed-btn secondary"
            disabled={shadowLoading}
            onClick={() => fileRef.current?.click()}
          >
            Upload CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadCsv(f);
              e.target.value = '';
            }}
          />
        </div>
        <p className="feed-file">
          CSV columns: address, purchase_price, arv, rehab_estimate, monthly_rent,
          monthly_debt_service, verdict, reasoning
        </p>
        {shadowError && <div className="feed-result diverged">{shadowError}</div>}
        {shadowResult && renderShadow(shadowResult)}
      </section>
    </div>
  );
}
