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
  const [assigning, setAssigning] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch('');
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

  const assign = async (memberId: string) => {
    setAssigning(memberId);
    setError(null);
    try {
      const res = await brain.assignClickUpTask(taskId, memberId);
      if (res.status === 'connect_source') {
        setError('ClickUp not connected');
        return;
      }
      onAssigned?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assign failed');
    } finally {
      setAssigning(null);
    }
  };

  if (!open) return null;

  return (
    <div className="quick-assign-backdrop" role="presentation" onClick={onClose}>
      <div
        className="quick-assign-sheet hud-corners"
        role="dialog"
        aria-label="Assign ClickUp task"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quick-assign-sheet__head">
          <div>
            <span className="quick-assign-sheet__kicker">Quick Assign</span>
            <h3 className="quick-assign-sheet__title">Assign team member</h3>
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
          autoFocus
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
                className="quick-assign-sheet__member"
                disabled={assigning !== null}
                onClick={() => void assign(m.id)}
              >
                <span className="quick-assign-sheet__name">{m.name}</span>
                <span className="quick-assign-sheet__meta">
                  {m.email || m.username}
                </span>
                {assigning === m.id && (
                  <span className="quick-assign-sheet__busy">Assigning…</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
