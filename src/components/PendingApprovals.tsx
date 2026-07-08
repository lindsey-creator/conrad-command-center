import { useCallback, useState } from 'react';
import { brain, type ApprovalItem } from '../api/brain';
import { POLL_MODULE_MS } from '../hooks/brainPoll';
import { useBrainQuery } from '../hooks/useBrainQuery';
import { ApprovalQueuePanel } from './ApprovalQueuePanel';

function PendingApprovalItem({
  item,
  onResolved,
}: {
  item: ApprovalItem;
  onResolved: () => void;
}) {
  const [draft, setDraft] = useState(item.content);

  return (
    <div className="pending-approval-item">
      <div className="brief-kicker">
        {item.kind === 'task' ? 'ClickUp task' : 'Draft'} · pending
      </div>
      <ApprovalQueuePanel
        approvalId={item.id}
        draft={draft}
        originalDraft={item.content}
        onDraftChange={setDraft}
        onResolved={onResolved}
      />
    </div>
  );
}

export function PendingApprovals() {
  const fetchPending = useCallback(() => brain.pendingApprovals(), []);
  const { data, loading, refresh } = useBrainQuery('approvals-pending', fetchPending, {
    refreshMs: POLL_MODULE_MS,
  });

  const items = data?.items ?? [];
  if (loading && !data) return null;
  if (!items.length) return null;

  return (
    <section className="feed-section hud-corners pending-approvals">
      <h3>Approval Queue</h3>
      <p className="feed-hint">Nothing sends without your gate.</p>
      {items.map((item) => (
        <PendingApprovalItem key={item.id} item={item} onResolved={() => refresh()} />
      ))}
    </section>
  );
}
