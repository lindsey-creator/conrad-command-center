export const COMMANDS = [
  { id: 'brief', label: 'Brief me', text: 'Brief me', mutate: false },
  { id: 'leak', label: "What's leaking?", text: "What's leaking?", mutate: false },
  { id: 'put', label: 'Put [X] on [board]', text: 'Put [X] on [board/meeting]', mutate: false },
  { id: 'sharpen', label: 'Sharpen [X]', text: 'Have Rhino sharpen [X]', mutate: false },
  { id: 'go', label: 'Go/approve Type-1', text: 'Go/approve Type-1', mutate: true },
] as const;

/** GO lane only: send / publish / spend / outreach / sign / $. Auto lane never auto-sends. */
export function needsConfirm(text: string): boolean {
  const q = text.trim();
  if (!q) return false;
  if (/^brief me\b/i.test(q)) return false;
  if (/what'?s leaking/i.test(q)) return false;
  if (/\b(draft|research|assign|schedule|put\b.+\bon\b|sharpen)\b/i.test(q) && !/\b(send|publish|spend|outreach|sign|\$)\b/i.test(q)) {
    return false;
  }
  return /\b(send|publish|spend|outreach|sign\b|go\/approve|approve\b|\$)\b/i.test(q);
}
