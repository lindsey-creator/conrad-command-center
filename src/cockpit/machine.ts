/** Rhino one-pager canon — modes and intent before data. */

export type DeckMode = 'idle' | 'talk';

export type OrbMotion =
  | 'idle-pulse'
  | 'listen-ripple'
  | 'think-swirl'
  | 'speak-wave'
  | 'alert-flare';

export type RailId = 'type1' | 'orbit';

const TYPE1_INTENT =
  /\b(type-?1|money|dollar|deal|close|capital|ghl|non-?qm|leak|leaking|overdue|late|hole|slip|decide|decision|call|judgment|target|efficiency|town|rise)\b/i;

/** HUD raises Type-1 glass only (3 cards). Orbit is WHOOP, not a Type-1 card. */
export function railsForIntent(text: string): RailId[] {
  const raw = text.trim();
  if (!raw) return [];
  if (/\b(brief me|catch me up|status|overview|what's up)\b/i.test(raw)) return [];
  if (/\b(whoop|recovery|sleep|strain|orbit|calendar|schedule|protect)\b/i.test(raw) && !TYPE1_INTENT.test(raw)) {
    return ['orbit'];
  }
  if (TYPE1_INTENT.test(raw)) return ['type1'];
  return [];
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
  return raised.includes('type1');
}

export function flareTone(raised: RailId[]): 'amber' | 'red' | undefined {
  if (raised.includes('type1')) return 'red';
  return undefined;
}
