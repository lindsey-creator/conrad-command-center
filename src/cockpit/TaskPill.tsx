import { useState } from 'react';
import type { JobChip } from './useAgentJobs';

const ASK: Record<string, string> = {
  brief: 'Brief me',
  leak: "What's leaking?",
  type1: 'Go/approve Type-1',
  meet: 'Protect my calendar and WHOOP day.',
  apply: 'Money now — what dollar should I move?',
  plaud: 'Brief me',
  rhino: 'Brief me',
};

interface TaskPillProps {
  jobs: JobChip[];
  onAsk: (command: string) => void;
}

/** EliseyRotar compact task pill — click-to-expand, not a SaaS card. */
export function TaskPill({ jobs, onAsk }: TaskPillProps) {
  const [open, setOpen] = useState(false);
  const proven = jobs.filter((j) => j.proven).length;

  return (
    <div className={`task-pill${open ? ' is-open' : ''}`}>
      <button type="button" className="task-pill__dot" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <i aria-hidden="true" />
        <span>
          {proven}/{jobs.length} JOBS
        </span>
      </button>
      {open ? (
        <ol className="task-pill__list">
          {jobs.slice(0, 4).map((job) => (
            <li key={job.id}>
              <button type="button" onClick={() => onAsk(ASK[job.id] ?? 'Brief me')}>
                <b>{job.tag}</b>
                <u className={job.proven ? 'is-proven' : 'is-claimed'}>{job.proven ? 'PROVEN' : 'CLAIMED'}</u>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
