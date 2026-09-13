interface Subsystem {
  id: string;
  label: string;
  status: 'PROVEN' | 'STANDBY' | 'CONNECT' | 'LIVE';
  detail: string;
}

interface AgentPanelProps {
  rows: Subsystem[];
}

export function AgentPanel({ rows }: AgentPanelProps) {
  return (
    <aside className="agent-panel j-bracket" aria-label="Subsystems">
      <header>
        <span>SUBSYSTEMS</span>
        <i>{String(rows.length).padStart(2, '0')}</i>
      </header>
      <ul>
        {rows.map((row) => (
          <li key={row.id} data-status={row.status}>
            <b>{row.label}</b>
            <em>{row.status}</em>
            <span>{row.detail}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
