import { useState } from 'react';
import { brain } from '../api/brain';

interface ApprovalQueuePanelProps {
  approvalId?: string | null;
  draft: string;
  originalDraft?: string;
  onDraftChange: (text: string) => void;
  onResolved?: (action: 'approved' | 'denied') => void;
}

export function ApprovalQueuePanel({
  approvalId,
  draft,
  originalDraft,
  onDraftChange,
  onResolved,
}: ApprovalQueuePanelProps) {
  const [loading, setLoading] = useState<'approve' | 'deny' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAct = Boolean(approvalId) && draft.trim().length > 0;

  const handleApprove = async () => {
    if (!approvalId) return;
    setLoading('approve');
    setError(null);
    setMessage(null);
    try {
      const res = await brain.approveApproval(approvalId, draft);
      if (res.status === 'error') {
        setError(res.error ?? 'Approval failed');
        return;
      }
      setMessage(res.note ?? 'Approved.');
      onResolved?.('approved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed');
    } finally {
      setLoading(null);
    }
  };

  const handleDeny = async () => {
    if (!approvalId) return;
    setLoading('deny');
    setError(null);
    setMessage(null);
    try {
      const res = await brain.denyApproval(approvalId);
      if (res.status === 'error') {
        setError(res.error ?? 'Deny failed');
        return;
      }
      setMessage('Denied — nothing was sent or created.');
      onResolved?.('denied');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deny failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="approval-queue">
      <h4>Approval Queue</h4>
      <textarea
        className="feed-textarea"
        style={{ minHeight: 100 }}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
      />
      {!approvalId && (
        <p className="feed-hint">
          Update the Brain to enable approve/deny — drafts still require your gate before
          anything sends.
        </p>
      )}
      <div className="approval-btns">
        <button
          type="button"
          className="approve"
          disabled={!canAct || loading !== null}
          onClick={() => void handleApprove()}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={() => onDraftChange(originalDraft ?? draft)}
          disabled={loading !== null}
        >
          Reset edit
        </button>
        <button
          type="button"
          className="deny"
          disabled={!approvalId || loading !== null}
          onClick={() => void handleDeny()}
        >
          {loading === 'deny' ? 'Denying…' : 'Deny'}
        </button>
      </div>
      {message && <p className="feed-result">{message}</p>}
      {error && <p className="feed-error">{error}</p>}
    </div>
  );
}
