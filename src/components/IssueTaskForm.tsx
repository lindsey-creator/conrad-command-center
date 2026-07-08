import { useState } from 'react';
import { brain, type IssueTaskResponse } from '../api/brain';
import { ApprovalQueuePanel } from './ApprovalQueuePanel';
import { ConnectSource } from './ConnectSource';

interface IssueTaskFormProps {
  sources?: string[];
  onConnect?: (source: string) => void;
  compact?: boolean;
}

function formatMetric(value: number | string | null | undefined): string {
  if (value == null || value === '') return '—';
  return String(value);
}

export function IssueTaskForm({ sources = ['clickup'], onConnect, compact }: IssueTaskFormProps) {
  const [text, setText] = useState('');
  const [assigneeHint, setAssigneeHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IssueTaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState('');

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await brain.issueTask({
        text: trimmed,
        assignee_hint: assigneeHint.trim() || undefined,
        source: 'command_center',
      });
      setResult(res);
      if (res.status !== 'connect_source' && !res.error) {
        if (res.approval_id) {
          setTaskDraft(trimmed);
        } else {
          setText('');
          setAssigneeHint('');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Task routing failed');
    } finally {
      setLoading(false);
    }
  };

  const needsConnect = result?.status === 'connect_source';

  return (
    <div className={`issue-task${compact ? ' issue-task--compact' : ''}`}>
      <label className="feed-label" htmlFor="issue-task-text">
        Task (voice or text)
      </label>
      <textarea
        id="issue-task-text"
        className="feed-textarea"
        rows={compact ? 2 : 3}
        placeholder="Tell Aaron to loop Baker on Ridgeline comps before quoting margin…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label className="feed-label" htmlFor="issue-task-assignee">
        Route to (optional)
      </label>
      <input
        id="issue-task-assignee"
        className="feed-input"
        type="text"
        placeholder="Aaron, Emma, Ken…"
        value={assigneeHint}
        onChange={(e) => setAssigneeHint(e.target.value)}
      />
      <div className="feed-actions">
        <button
          type="button"
          className="feed-btn"
          disabled={loading || !text.trim()}
          onClick={() => void handleSubmit()}
        >
          {loading ? 'Routing…' : 'Issue to ClickUp'}
        </button>
      </div>
      {error && <p className="feed-error">{error}</p>}
      {result && !needsConnect && !result.error && result.approval_id && (
        <ApprovalQueuePanel
          approvalId={result.approval_id}
          draft={taskDraft}
          originalDraft={taskDraft}
          onDraftChange={setTaskDraft}
          onResolved={() => {
            setResult(null);
            setText('');
            setAssigneeHint('');
            setTaskDraft('');
          }}
        />
      )}
      {result && !needsConnect && !result.error && !result.approval_id && (
        <div className="feed-result">
          {result.requires_approval
            ? 'Queued for your approval before it lands in ClickUp.'
            : 'Routed to ClickUp.'}
          {result.routed_to && (
            <>
              {' '}
              Assignee: <strong>{result.routed_to}</strong>
            </>
          )}
          {result.task_id && (
            <>
              {' '}
              (<code>{result.task_id}</code>)
            </>
          )}
          {result.note && <p className="feed-hint">{result.note}</p>}
        </div>
      )}
      {result?.error && <p className="feed-error">{result.error}</p>}
      {needsConnect && (
        <ConnectSource
          sources={result?.sources?.length ? result.sources : sources}
          onConnect={onConnect}
        />
      )}
    </div>
  );
}

export function formatAdsMetric(value: number | string | null | undefined): string {
  return formatMetric(value);
}
