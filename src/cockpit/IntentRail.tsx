import type { IntentId } from './machine';

const PILLS: { id: IntentId; label: string; detail: string; text: string }[] = [
  { id: 'orbit', label: 'DAY ORBIT', detail: 'Protect calendar + WHOOP', text: 'Protect my calendar and WHOOP day.' },
  { id: 'leak', label: 'LEAKING', detail: "What's leaking?", text: "What's leaking?" },
  { id: 'type1', label: 'TYPE-1', detail: 'Escalate only · no auto-send', text: 'Go/approve Type-1' },
  { id: 'money', label: 'MONEY NOW', detail: 'What dollar moves?', text: 'Money now — what dollar should I move?' },
];

interface IntentRailProps {
  raised: IntentId[];
  onAsk: (command: string) => void;
}

/** Talk Mode left rail — glass intent chips, not SaaS cards. */
export function IntentRail({ raised, onAsk }: IntentRailProps) {
  return (
    <nav className="intent-rail" aria-label="Intent panels">
      {PILLS.map((pill) => (
        <button
          key={pill.id}
          type="button"
          className={`intent-rail__chip${raised.includes(pill.id) ? ' is-on' : ''}`}
          onClick={() => onAsk(pill.text)}
        >
          <b>{pill.label}</b>
          <span>{pill.detail}</span>
        </button>
      ))}
    </nav>
  );
}
