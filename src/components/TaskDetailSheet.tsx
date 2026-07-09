import { useCallback, useEffect, useState } from 'react';
import { brain, type ClickUpTaskComment, type ClickUpTaskDetail } from '../api/brain';

interface TaskDetailSheetProps {
  taskId: string;
  open: boolean;
  onClose: () => void;
  onCommentSent?: () => void;
}

function formatCommentTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function TaskDetailSheet({
  taskId,
  open,
  onClose,
  onCommentSent,
}: TaskDetailSheetProps) {
  const [task, setTask] = useState<ClickUpTaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSent(false);
    try {
      const res = await brain.fetchClickUpTaskDetail(taskId);
      if (res.status === 'connect_source') {
        setTask(null);
        setError('ClickUp not connected');
        return;
      }
      if (!res.task) {
        setTask(null);
        setError('Task not found');
        return;
      }
      setTask(res.task);
    } catch (e) {
      setTask(null);
      setError(e instanceof Error ? e.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!open) return;
    setTask(null);
    setInstructions('');
    void loadTask();
  }, [open, loadTask]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const sendInstructions = async () => {
    const text = instructions.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    setSent(false);
    try {
      const res = await brain.postClickUpTaskComment(taskId, text);
      if (res.status === 'connect_source') {
        setError('ClickUp not connected');
        return;
      }
      setInstructions('');
      setSent(true);
      const detail = await brain.fetchClickUpTaskDetail(taskId);
      if (detail.task) setTask(detail.task);
      onCommentSent?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send instructions');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="quick-assign-backdrop" role="presentation" onClick={onClose}>
      <div
        className="clickup-detail-sheet hud-corners jarvis-glass"
        role="dialog"
        aria-modal="true"
        aria-label="ClickUp task details"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quick-assign-sheet__head">
          <div>
            <span className="quick-assign-sheet__kicker">Task Brief</span>
            <h3 className="quick-assign-sheet__title">
              {loading ? 'Loading…' : task?.name || 'ClickUp task'}
            </h3>
            {task && (
              <div className="clickup-detail-sheet__meta-row">
                {task.status && (
                  <span className="clickup-detail-sheet__pill">{task.status}</span>
                )}
                <span
                  className={`clickup-detail-sheet__pill clickup-detail-sheet__pill--assignee${
                    task.assignee === 'Unassigned'
                      ? ' clickup-detail-sheet__pill--unassigned'
                      : ''
                  }`}
                >
                  {task.assignee}
                </span>
                {task.due_date ? (
                  <span className="clickup-detail-sheet__pill clickup-detail-sheet__pill--due">
                    Due {task.due_date}
                  </span>
                ) : (
                  <span className="clickup-detail-sheet__pill clickup-detail-sheet__pill--due">
                    No due date
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="quick-assign-sheet__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && (
          <p className="quick-assign-sheet__hint clickup-detail-sheet__status">
            Reading task from ClickUp…
          </p>
        )}

        {error && !loading && (
          <div className="clickup-detail-sheet__error-wrap">
            <p className="quick-assign-sheet__error" role="alert">
              {error}
            </p>
            <button
              type="button"
              className="clickup-detail-sheet__retry"
              onClick={() => void loadTask()}
            >
              Retry
            </button>
          </div>
        )}

        {task && !loading && (
          <div className="clickup-detail-sheet__scroll">
            {(task.list_name || task.space_name) && (
              <p className="clickup-detail-sheet__context">
                {[task.space_name, task.list_name].filter(Boolean).join(' · ')}
              </p>
            )}

            {task.url && (
              <p className="clickup-detail-sheet__link-wrap">
                <a
                  className="clickup-detail-sheet__link"
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in ClickUp ↗
                </a>
              </p>
            )}

            <section className="clickup-detail-sheet__section">
              <h4 className="clickup-detail-sheet__section-title">Description</h4>
              {task.description ? (
                <div className="clickup-detail-sheet__body">{task.description}</div>
              ) : (
                <p className="clickup-detail-sheet__empty">No description on this task.</p>
              )}
            </section>

            <section className="clickup-detail-sheet__section">
              <h4 className="clickup-detail-sheet__section-title">
                Comments{(task.comments?.length ?? 0) > 0 ? ` (${task.comments.length})` : ''}
              </h4>
              {(task.comments?.length ?? 0) > 0 ? (
                <ul className="clickup-detail-sheet__comments">
                  {(task.comments ?? []).map((c: ClickUpTaskComment) => (
                    <li key={c.id} className="clickup-detail-sheet__comment">
                      <div className="clickup-detail-sheet__comment-head">
                        <span className="clickup-detail-sheet__comment-author">{c.author}</span>
                        {c.created_at && (
                          <time
                            className="clickup-detail-sheet__comment-time"
                            dateTime={c.created_at}
                          >
                            {formatCommentTime(c.created_at)}
                          </time>
                        )}
                      </div>
                      <p className="clickup-detail-sheet__comment-text">{c.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="clickup-detail-sheet__empty">No comments yet.</p>
              )}
            </section>
          </div>
        )}

        {task && !loading && (
          <>
            <div className="quick-assign-sheet__note-wrap clickup-detail-sheet__instructions">
              <label className="quick-assign-sheet__note-label" htmlFor="task-instructions">
                Instructions for team
              </label>
              <textarea
                id="task-instructions"
                className="quick-assign-sheet__note echo-command__input"
                rows={4}
                placeholder="What should the team do next?"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                disabled={sending}
              />
            </div>

            {sent && (
              <p className="clickup-detail-sheet__sent" role="status">
                Instructions sent to ClickUp.
              </p>
            )}

            <div className="quick-assign-sheet__footer">
              <button
                type="button"
                className="quick-assign-sheet__cancel"
                onClick={onClose}
                disabled={sending}
              >
                Close
              </button>
              <button
                type="button"
                className="quick-assign-sheet__confirm clickup-detail-sheet__send"
                disabled={!instructions.trim() || sending}
                onClick={() => void sendInstructions()}
              >
                {sending ? 'Sending…' : 'Send instructions'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
