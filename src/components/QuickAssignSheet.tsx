import { useEffect, useMemo, useState } from 'react';
import { brain, type ClickUpMember } from '../api/brain';

interface QuickAssignSheetProps {
  taskId: string;
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

export function QuickAssignSheet({
  taskId,
  open,
  onClose,
  onAssigned,
}: QuickAssignSheetProps) {
  const [members, setMembers] = useState<ClickUpMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setNote('');
    setSelectedId(null);
    setError(null);
    setLoading(true);
    void brain
      .clickUpMembers()
      .then((res) => {
        if (res.status === 'connect_source') {
          setError('ClickUp not connected');
          setMembers([]);
          return;
        }
        setMembers(res.members ?? []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load team');
      })
      .finally(() => setLoading(false));
  }, [open, taskId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  const selectedMember = members.find((m) => m.id === selectedId) ?? null;

  const confirmAssign = async () => {
    if (!selectedId) return;
    setAssigning(true);
    setError(null);
    try {
      const res = await brain.assignClickUpTask(taskId, selectedId, note);
      if (res.status === 'connect_source') {
        setError('ClickUp not connected');
        return;
      }
      onAssigned?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assign failed');
    } finally {
      setAssigning(false);
    }
  };

  if (!open) return null;

  return (
    <div className="quick-assign-backdrop" role="presentation" onClick={onClose}>
      <div
        className="quick-assign-sheet hud-corners jarvis-glass"
        role="dialog"
        aria-label="Assign ClickUp task"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quick-assign-sheet__head">
          <div>
            <span className="quick-assign-sheet__kicker">Quick Assign</span>
            <h3 className="quick-assign-sheet__title">Assign team member</h3>
            <p className="quick-assign-sheet__hint quick-assign-sheet__hint--rule">
              Existing tasks only — new tasks route to Lindsey for review.
            </p>
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
        <input
          className="quick-assign-sheet__search"
          type="search"
          placeholder="Search team…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="quick-assign-sheet__note-label" htmlFor="quick-assign-note">
          Note <span className="quick-assign-sheet__optional">(optional)</span>
        </label>
        <textarea
          id="quick-assign-note"
          className="quick-assign-sheet__note feed-textarea"
          placeholder="Context for the assignee — posted as a ClickUp comment"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
        {loading && <p className="quick-assign-sheet__hint">Loading team…</p>}
        {error && (
          <p className="quick-assign-sheet__error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="quick-assign-sheet__hint">No members match.</p>
        )}
        <ul className="quick-assign-sheet__list">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`quick-assign-sheet__member${
                  selectedId === m.id ? ' quick-assign-sheet__member--selected' : ''
                }`}
                disabled={assigning}
                onClick={() => setSelectedId(m.id)}
                aria-pressed={selectedId === m.id}
              >
                <span className="quick-assign-sheet__member-row">
                  <span className="quick-assign-sheet__initials" aria-hidden="true">
                    {m.initials || m.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="quick-assign-sheet__name">{m.name}</span>
                </span>
                <span className="quick-assign-sheet__meta">
                  {m.email || m.username}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="quick-assign-sheet__note-wrap">
          <label className="quick-assign-sheet__note-label" htmlFor="assign-note">
            Note <span className="quick-assign-sheet__optional">(optional)</span>
          </label>
          <textarea
            id="assign-note"
            className="quick-assign-sheet__note echo-command__input"
            rows={3}
            placeholder={
              selectedMember
                ? `Context for ${selectedMember.name}…`
                : 'Add assignment context…'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={assigning}
          />
        </div>
        <div className="quick-assign-sheet__footer">
          <button
            type="button"
            className="quick-assign-sheet__cancel"
            onClick={onClose}
            disabled={assigning}
          >
            Cancel
          </button>
          <button
            type="button"
            className="quick-assign-sheet__confirm"
            disabled={!selectedId || assigning}
            onClick={() => void confirmAssign()}
          >
            {assigning ? 'Assigning…' : 'Confirm assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
