import { AGENT_JOBS, AUTONOMY_LABEL, AUTONOMY_LAW, type Autonomy } from './readyAgent';

interface JobRailProps {
  level: Autonomy;
}

/** Always-on job labels — not a feed table. Agent is already working. */
export function JobRail({ level }: JobRailProps) {
  return (
    <nav className="job-rail" aria-label="Ready agent jobs">
      <b className={`job-rail__lvl job-rail__lvl--${level}`}>{AUTONOMY_LABEL[level]}</b>
      <ol>
        {AGENT_JOBS.map((job) => (
          <li key={job.id} data-lvl={job.lvl} title={job.hold}>
            <i>{job.lvl}</i>
            <span>{job.tag}</span>
          </li>
        ))}
      </ol>
      <em>{AUTONOMY_LAW}</em>
    </nav>
  );
}
