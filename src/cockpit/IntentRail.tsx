import type { IntentId } from './machine';

const PLATES: { id: 'orbit' | 'leak'; label: string; detail: string; text: string }[] = [
  { id: 'orbit', label: 'DAY ORBIT', detail: 'Scan calendar · WHOOP · protect the day', text: 'Protect my calendar and WHOOP day.' },
  { id: 'leak', label: 'LEAKING', detail: 'Check integrity · close the hole', text: "What's leaking?" },
];

const ICONS = {
  orbit: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z',
  leak: 'M12 3l8 4v6c0 5-3.4 9.4-8 10.5C7.4 22.4 4 18 4 13V7l8-4z',
} as const;

interface IntentRailProps {
  raised: IntentId[];
  onAsk: (command: string) => void;
}

/** V2 Talk — left holographic plates, not pills. */
export function IntentRail({ raised, onAsk }: IntentRailProps) {
  return (
    <nav className="holo-rail" aria-label="Intent panels">
      {PLATES.map((plate) => (
        <button
          key={plate.id}
          type="button"
          className={`holo-plate${raised.includes(plate.id) ? ' is-on' : ''}`}
          onClick={() => onAsk(plate.text)}
        >
          <svg className="holo-plate__ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d={ICONS[plate.id]} fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <b>{plate.label}</b>
          <em>{plate.detail}</em>
        </button>
      ))}
    </nav>
  );
}
