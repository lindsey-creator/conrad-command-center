import { useState } from 'react';
import { brain } from '../api/brain';
import { TaskDetailSheet } from './TaskDetailSheet';
import { QuickAssignSheet } from './QuickAssignSheet';

interface ClickUpTaskActionsProps {
  taskId: string;
  assignee?: string | null;
  onUpdated?: () => void;
  onCompleted?: (taskId: string) => void;
  onCompleteFailed?: (taskId: string) => void;
  compact?: boolean;
}

export function ClickUpTaskActions({
  taskId,
  assignee,
  onUpdated,
  onCompleted,
  onCompleteFailed,
  compact,
}: ClickUpTaskActionsProps) {
  const [loading, setLoading] = useState<'complete' | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComplete = async () => {
    setLoading('complete');
    setError(null);
    onCompleted?.(taskId);
    try {
      const res = await brain.completeClickUpTask(taskId);
      if (res.status === 'connect_source') {
        onCompleteFailed?.(taskId);
        setError('ClickUp not connected');
        return;
      }
      onUpdated?.();
    } catch (e) {
      onCompleteFailed?.(taskId);
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className={`clickup-actions${compact ? ' clickup-actions--compact' : ''}`}>
        {assignee && assignee !== 'Unassigned' && (
          <span className="clickup-assignee-chip" title={`Assigned: ${assignee}`}>
            {assignee}
          </span>
        )}
        <button
          type="button"
          className="clickup-btn clickup-btn--gold"
          disabled={loading !== null}
          onClick={() => void runComplete()}
          aria-label="Mark task done"
        >
          {loading === 'complete' ? '…' : 'Done'}
        </button>
        <button
          type="button"
          className="clickup-btn clickup-btn--assign"
          disabled={loading !== null}
          onClick={() => setAssignOpen(true)}
          aria-label="Assign team member"
        >
          Assign
        </button>
        <button
          type="button"
          className="clickup-btn clickup-btn--cyan"
          disabled={loading !== null}
          onClick={() => setDetailOpen(true)}
          aria-label="View task and send instructions"
        >
          Open
        </button>
        {error && (
          <span className="clickup-actions__error" role="alert">
            {error}
          </span>
        )}
      </div>
      <QuickAssignSheet
        taskId={taskId}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onAssigned={onUpdated}
      />
      <TaskDetailSheet
        taskId={taskId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onCommentSent={onUpdated}
      />
    </>
  );
}
