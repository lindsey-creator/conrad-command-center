/** Rhino one-pager canon — modes and intent before data. */

export type DeckMode = 'idle' | 'talk';

export type OrbMotion =
  | 'idle-pulse'
  | 'listen-ripple'
  | 'think-swirl'
  | 'speak-wave'
  | 'alert-flare';

export type RailId = 'type1' | 'money' | 'leaking' | 'orbit';

export const RAILS: RailId[] = ['type1', 'money', 'leaking'];

const INTENT_MAP: { test: RegExp; rail: RailId }[] = [
  { test: /\b(money|dollar|deal|close|capital|ghl|non-?qm)\b/i, rail: 'money' },
  { test: /\b(leak|leaking|overdue|late|hole|slip)\b/i, rail: 'leaking' },
  { test: /\b(type-?1|decide|decision|call|judgment|target)\b/i, rail: 'type1' },
  { test: /\b(calendar|orbit|schedule|today|day|protect)\b/i, rail: 'orbit' },
];

/** "Brief me" is orb-only — do not raise every panel. */
export function railsForIntent(text: string): RailId[] {
  const raw = text.trim();
  if (!raw) return [];
  if (/\b(brief me|catch me up|status|overview|what's up)\b/i.test(raw)) return [];
  const hit: RailId[] = [];
  for (const row of INTENT_MAP) {
    if (row.test.test(raw) && !hit.includes(row.rail)) hit.push(row.rail);
  }
  return hit.slice(0, 4);
}

export function orbMotion(opts: {
  mode: DeckMode;
  listening: boolean;
  thinking: boolean;
  speaking: boolean;
  alert: boolean;
}): OrbMotion {
  if (opts.mode === 'idle') return 'idle-pulse';
  if (opts.alert) return 'alert-flare';
  if (opts.speaking) return 'speak-wave';
  if (opts.thinking) return 'think-swirl';
  if (opts.listening) return 'listen-ripple';
  return 'think-swirl';
}

export function isAlertIntent(raised: RailId[]): boolean {
  return raised.includes('type1') || raised.includes('money');
}

export function flareTone(raised: RailId[]): 'amber' | 'red' | undefined {
  if (raised.includes('type1')) return 'red';
  if (raised.includes('money')) return 'amber';
  return undefined;
}
