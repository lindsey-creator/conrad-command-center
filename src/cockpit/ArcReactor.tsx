import { AGENT_LABEL, AGENT_WORK, type AgentState } from './agentState';

interface ArcReactorProps {
  state: AgentState;
  online: boolean;
  workingLine: string;
}

export function ArcReactor({ state, online, workingLine }: ArcReactorProps) {
  return (
    <section className={`arc-core arc-core--${state}${online ? ' arc-core--online' : ''}`} aria-label="Arc core">
      <div className="arc-core__head">
        <span className="panel-kicker">Arc Core</span>
      </div>
      <div className="arc-core__stage" role="img" aria-label={`Reactor ${AGENT_LABEL[state]}`}>
        <div className="arc-core__halo" aria-hidden="true" />
        <svg className="arc-core__svg" viewBox="0 0 200 200" aria-hidden="true">
          <circle className="arc-core__ring arc-core__ring--a" cx="100" cy="100" r="88" />
          <circle className="arc-core__ring arc-core__ring--b" cx="100" cy="100" r="72" />
          <circle className="arc-core__ring arc-core__ring--c" cx="100" cy="100" r="54" />
          <circle className="arc-core__tick-ring" cx="100" cy="100" r="80" />
          <circle className="arc-core__heart" cx="100" cy="100" r="22" />
          <circle className="arc-core__heart-core" cx="100" cy="100" r="10" />
        </svg>
        <div className="arc-core__state">{AGENT_LABEL[state]}</div>
      </div>
      <p className="arc-core__work">{AGENT_WORK[state]}</p>
      <p className="arc-core__scan">{workingLine}</p>
    </section>
  );
}
