import { LOOP_LABEL, LOOP_PHASES, type LoopPhase, type Autonomy } from './readyAgent';
import type { JobChip } from './useAgentJobs';

interface JobRailProps {
  level: Autonomy;
  phase: LoopPhase;
  jobs: JobChip[];
}

/** Top-7 live chips + loop. Anti-theater: every chip is PROVEN or CLAIMED. */
export function JobRail({ level, phase, jobs }: JobRailProps) {
  return (
    <nav className="job-rail" aria-label="Agentic loop and jobs">
      <ol className="job-rail__loop">
        {LOOP_PHASES.map((step) => (
          <li key={step} className={step === phase ? 'is-on' : undefined}>
            {LOOP_LABEL[step]}
          </li>
        ))}
      </ol>
      <b className={`job-rail__lvl job-rail__lvl--${level}`}>{level}</b>
      <ol className="job-rail__jobs">
        {jobs.map((job) => (
          <li key={job.id} data-proven={job.proven} title={job.hold}>
            <span>{job.tag}</span>
            <u className={job.proven ? 'is-proven' : 'is-claimed'}>{job.proven ? 'PROVEN' : 'CLAIMED'}</u>
          </li>
        ))}
      </ol>
    </nav>
  );
}
