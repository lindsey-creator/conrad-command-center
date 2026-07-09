import { useState } from 'react';
import { brain } from '../api/brain';
import { QuickAssignSheet } from './QuickAssignSheet';

interface ClickUpTaskActionsProps {
  taskId: string;
  onUpdated?: () => void;
  compact?: boolean;
}

export function ClickUpTaskActions({
  taskId,
  onUpdated,
  compact,
}: ClickUpTaskActionsProps) {
  const [loading, setLoading] = useState<'complete' | 'open' | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: 'complete' | 'open') => {
    setLoading(action);
    setError(null);
    try {
      const res =
        action === 'complete'
          ? await brain.completeClickUpTask(taskId)
          : await brain.reopenClickUpTask(taskId);
      if (res.status === 'connect_source') {
        setError('ClickUp not connected');
        return;
      }
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className={`clickup-actions${compact ? ' clickup-actions--compact' : ''}`}>
        <button
          type="button"
          className="clickup-btn clickup-btn--gold"
          disabled={loading !== null}
          onClick={() => void run('complete')}
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
          onClick={() => void run('open')}
          aria-label="Reopen task"
        >
          {loading === 'open' ? '…' : 'Open'}
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
    </>
  );
}
