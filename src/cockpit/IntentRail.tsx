import type { IntentId } from './machine';

const PILLS: { id: IntentId; label: string; detail: string; text: string }[] = [
  { id: 'orbit', label: 'DAY ORBIT', detail: 'Plan route · calendar + WHOOP', text: 'Protect my calendar and WHOOP day.' },
  { id: 'leak', label: 'LEAKING', detail: 'Check suit integrity', text: "What's leaking?" },
  { id: 'type1', label: 'TYPE-1', detail: 'Run diagnostics · no auto-send', text: 'Go/approve Type-1' },
  { id: 'money', label: 'MONEY NOW', detail: "Show today's dollar moves", text: 'Money now — what dollar should I move?' },
];

const ICONS: Record<IntentId, string> = {
  orbit: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z',
  leak: 'M12 3l8 4v6c0 5-3.4 9.4-8 10.5C7.4 22.4 4 18 4 13V7l8-4zm0 6v8m-3-4h6',
  type1:
    'M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM12 2v3M12 19v3M2 12h3M19 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M5.2 18.8l2.1-2.1M16.7 7.3l2.1-2.1',
  money: 'M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2zm1 5h8M8 13h5',
};

interface IntentRailProps {
  raised: IntentId[];
  onAsk: (command: string) => void;
}

/** Talk Mode left rail — Higgsfield intent chips, not SaaS cards. */
export function IntentRail({ raised, onAsk }: IntentRailProps) {
  return (
    <nav className="intent-rail" aria-label="Intent panels">
      <p className="intent-rail__kicker">INTENT</p>
      {PILLS.map((pill) => (
        <button
          key={pill.id}
          type="button"
          className={`intent-rail__chip${raised.includes(pill.id) ? ' is-on' : ''}`}
          onClick={() => onAsk(pill.text)}
        >
          <svg className="intent-rail__ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d={ICONS[pill.id]} fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="intent-rail__copy">
            <b>{pill.label}</b>
            <em>{pill.detail}</em>
          </span>
          <svg className="intent-rail__wave" viewBox="0 0 56 12" aria-hidden="true">
            <path
              d="M0 6 L6 6 L10 2 L14 10 L18 4 L22 8 L28 6 L34 3 L40 9 L46 5 L52 6 L56 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </button>
      ))}
    </nav>
  );
}
