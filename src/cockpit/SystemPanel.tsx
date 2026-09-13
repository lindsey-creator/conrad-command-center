interface Diag {
  label: string;
  value: string;
  tone?: 'ok' | 'hold' | 'alert';
}

interface SystemPanelProps {
  rows: Diag[];
}

export function SystemPanel({ rows }: SystemPanelProps) {
  return (
    <aside className="system-panel j-bracket" aria-label="Suit diagnostics">
      <header>
        <span>SUIT DIAGNOSTICS</span>
        <i>HOLD</i>
      </header>
      <ul>
        {rows.map((row) => (
          <li key={row.label} data-tone={row.tone ?? 'hold'}>
            <b>{row.label}</b>
            <em>{row.value}</em>
          </li>
        ))}
      </ul>
    </aside>
  );
}
