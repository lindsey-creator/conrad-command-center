/** Rhino sharpen LOCK — modes, Wispr states, intent rails. */

export type DeckMode = 'idle' | 'talk';

export type WisprState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export type WisprEvent =
  | { type: 'listen' }
  | { type: 'ask' }
  | { type: 'reply' }
  | { type: 'spoke' }
  | { type: 'fail' }
  | { type: 'end' }
  | { type: 'barge' };

export type OrbMotion =
  | 'idle-pulse'
  | 'listen-ripple'
  | 'think-swirl'
  | 'speak-wave'
  | 'alert-flare';

export type IntentId = 'money' | 'leak' | 'type1' | 'orbit';
export type RailId = 'type1' | 'orbit';

export const INTENT_CAP = 4;
export const TYPE1_CARD_CAP = 3;
export const ALL_INTENTS: IntentId[] = ['money', 'leak', 'type1', 'orbit'];

export const WISPR_LABEL: Record<WisprState, string> = {
  idle: 'IDLE',
  listening: 'LISTENING',
  thinking: 'THINKING',
  speaking: 'SPEAKING',
  error: 'ERROR',
};

export const WISPR_CAPTION: Record<WisprState, string> = {
  idle: 'Talk Mode. Orb owns the center.',
  listening: 'Listening.',
  thinking: 'Thinking.',
  speaking: 'Speaking.',
  error: 'Error. Type the command, sir.',
};

const TYPE1_INTENT =
  /\b(type-?1|money|dollar|deal|close|capital|ghl|non-?qm|leak|leaking|overdue|late|hole|slip|decide|decision|call|judgment|target|efficiency|town|rise)\b/i;

export function reduceWispr(state: WisprState, event: WisprEvent): WisprState {
  switch (event.type) {
    case 'listen':
    case 'barge':
      return 'listening';
    case 'ask':
      return 'thinking';
    case 'reply':
      return 'speaking';
    case 'spoke':
      return state === 'speaking' ? 'idle' : state;
    case 'fail':
      return 'error';
    case 'end':
      return 'idle';
    default:
      return state;
  }
}

export function motionForWispr(state: WisprState, alert = false): OrbMotion {
  if (state === 'error') return 'alert-flare';
  if (alert && state !== 'idle') return 'alert-flare';
  if (state === 'speaking') return 'speak-wave';
  if (state === 'thinking') return 'think-swirl';
  if (state === 'listening') return 'listen-ripple';
  return 'idle-pulse';
}

/** @deprecated use motionForWispr */
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

export function capIntents(ids: IntentId[]): IntentId[] {
  const seen = new Set<IntentId>();
  const out: IntentId[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= INTENT_CAP) break;
  }
  return out;
}

/** Intent → panel. Max 4. Brief raises the full bay. */
export function intentsForQuery(text: string): IntentId[] {
  const raw = text.trim();
  if (!raw) return ['type1'];
  if (/\b(brief me|catch me up|status|overview|what's up)\b/i.test(raw)) {
    return capIntents(ALL_INTENTS);
  }
  const raised: IntentId[] = [];
  if (/\b(whoop|recovery|sleep|strain|orbit|calendar|schedule|protect)\b/i.test(raw)) {
    raised.push('orbit');
  }
  if (/\b(leak|leaking|overdue|late|hole|slip|feed owner|dead phone)\b/i.test(raw)) {
    raised.push('leak');
  }
  if (/\b(money|dollar|payout|fund|sla|deal|close|capital|ghl)\b/i.test(raw)) {
    raised.push('money');
  }
  if (TYPE1_INTENT.test(raw) || raised.includes('money') || raised.includes('leak')) {
    raised.push('type1');
  }
  return capIntents(raised.length ? raised : ['type1']);
}

/** HUD raises Type-1 glass only (3 cards). Orbit is WHOOP, not a Type-1 card. */
export function railsForIntent(text: string): RailId[] {
  const ids = intentsForQuery(text);
  const rails: RailId[] = [];
  if (ids.includes('type1') || ids.includes('money') || ids.includes('leak')) rails.push('type1');
  if (ids.includes('orbit')) rails.push('orbit');
  return rails;
}

export function isAlertIntent(raised: readonly string[]): boolean {
  return raised.includes('type1') || raised.includes('money') || raised.includes('leak');
}

export function flareTone(raised: RailId[]): 'amber' | 'red' | undefined {
  if (raised.includes('type1')) return 'red';
  return undefined;
}

export function wisprFromSearch(search = typeof window === 'undefined' ? '' : window.location.search): WisprState | null {
  const v = new URLSearchParams(search).get('wispr');
  if (v === 'idle' || v === 'listening' || v === 'thinking' || v === 'speaking' || v === 'error') return v;
  return null;
}
