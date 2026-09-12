export const COMMANDS = [
  { id: 'brief', label: 'Brief me', text: 'Brief me', mutate: false },
  { id: 'leak', label: "What's leaking?", text: "What's leaking?", mutate: false },
  { id: 'put', label: 'Put [X] on [board]', text: 'Put [X] on [board/meeting]', mutate: true },
  { id: 'sharpen', label: 'Sharpen [X]', text: 'Have Rhino sharpen [X]', mutate: true },
  { id: 'go', label: 'Go/approve Type-1', text: 'Go/approve Type-1', mutate: true },
] as const;

/** State-changing commands confirm on glass. They never auto-execute. */
export function needsConfirm(text: string): boolean {
  const q = text.trim();
  if (!q) return false;
  if (/^brief me\b/i.test(q)) return false;
  if (/what'?s leaking/i.test(q)) return false;
  return /\b(put\b.+\bon\b|sharpen|go\/approve|approve\b|execute|issue task|create task)\b/i.test(q);
}
