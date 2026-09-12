/** Rhino FULL AGENTIC LOCK — loop, L0–L3, Auto vs GO, top-7 jobs. No invented numbers. */

export type Autonomy = 'L0' | 'L1' | 'L2' | 'L3';
export type LoopPhase = 'observe' | 'reason' | 'act' | 'evidence' | 'escalate';

export const LOOP_PHASES: LoopPhase[] = ['observe', 'reason', 'act', 'evidence', 'escalate'];

export const LOOP_LABEL: Record<LoopPhase, string> = {
  observe: 'OBSERVE',
  reason: 'REASON',
  act: 'ACT',
  evidence: 'EVIDENCE',
  escalate: 'ESCALATE',
};

export const AUTONOMY_LABEL: Record<Autonomy, string> = {
  L0: 'L0 SILENT',
  L1: 'L1 REPORT',
  L2: 'L2 AUTO',
  L3: 'L3 GO',
};

export const AUTO_LANE = 'AUTO · drafts · research · assign · schedule · board';
export const GO_LANE = 'GO · send · publish · spend · outreach · sign · $';
export const AUTONOMY_LAW = 'Never Team GHL · Never ChatGPT-as-him · Never auto-send';

export function nextLoopPhase(tick: number): LoopPhase {
  return LOOP_PHASES[Math.max(0, tick) % LOOP_PHASES.length];
}

/** L3 only with Type-1 evidence or an explicit GO. Escalate without proof stays L1. */
export function resolveAutonomy(opts: {
  phase: LoopPhase;
  type1Proven: boolean;
  goArmed: boolean;
}): Autonomy {
  if (opts.goArmed || (opts.phase === 'escalate' && opts.type1Proven)) return 'L3';
  if (opts.type1Proven) return 'L3';
  if (opts.phase === 'act') return 'L2';
  if (opts.phase === 'reason' || opts.phase === 'evidence') return 'L1';
  return 'L0';
}

export const TOP7 = [
  { id: 'brief', tag: 'MORNING BRIEF', hold: 'Daily brief on glass' },
  { id: 'apply', tag: 'GHL APPLY WATCH', hold: 'Personal GHL new/cold · Brighton dials' },
  { id: 'leak', tag: 'LEAK SWEEPER', hold: 'Feed owners · Instant Forms · dead phone' },
  { id: 'meet', tag: 'MEETING-PREP', hold: 'Calendar → action' },
  { id: 'plaud', tag: 'PLAUD EXTRACTOR', hold: 'Audio → actions' },
  { id: 'type1', tag: 'TYPE-1 QUEUE', hold: 'Max 3 · L3 GO only' },
  { id: 'rhino', tag: 'RHINO HANDOFF', hold: 'Loop not on the wire yet' },
] as const;

export type JobId = (typeof TOP7)[number]['id'];

export const HOLD = {
  money:
    'Holding payouts, fund, SLA. Apply radar is GHL new/cold only — Brighton owns dials. No invented dollar.',
  leak:
    'Watching mortgage-feed owners, Instant Forms, dead phone. No leak proven. No invented hole.',
  type1Money: 'Holding payouts / fund / SLA. No Type-1. L0–L2 stay off escalate.',
  type1Leak: 'Holding feed owners · Instant Forms · dead phone. No escalate.',
  type1Wall: 'Rise ≠ Non-QM firewall. Meeting→action armed. No Type-1.',
  orbit: 'Protecting gym. Meeting-prep armed. Calendar holding — no invented block.',
  whoop: 'PROTECT GYM · leave-state kill-warmer watched. No invented WHOOP.',
} as const;
