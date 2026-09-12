/** KB READY AGENT — jobs, autonomy, empty-state copy. No invented numbers. */

export type Autonomy = 'L0' | 'L1' | 'L2';

export function resolveAutonomy(type1Hot: boolean): Autonomy {
  return type1Hot ? 'L2' : 'L1';
}

export const AUTONOMY_LABEL: Record<Autonomy, string> = {
  L0: 'L0 SILENT',
  L1: 'L1 REPORT',
  L2: 'L2 TYPE-1',
};

export const AUTONOMY_LAW = 'Never Team GHL · Never ChatGPT-as-him · Never auto-send';

export const AGENT_JOBS = [
  { id: 'apply', lvl: 'L0' as const, tag: 'APPLY RADAR', hold: 'GHL new/cold · Brighton owns dials' },
  { id: 'type1', lvl: 'L2' as const, tag: 'TYPE-1', hold: 'Board max 3' },
  { id: 'money', lvl: 'L1' as const, tag: 'MONEY NOW', hold: 'Payouts · fund · SLA' },
  { id: 'leak', lvl: 'L1' as const, tag: 'LEAKING', hold: 'Feed owners · Instant Forms · dead phone' },
  { id: 'wall', lvl: 'L0' as const, tag: 'FIREWALL', hold: 'Rise ≠ Non-QM' },
  { id: 'nqm', lvl: 'L1' as const, tag: 'NQM DRAFTS', hold: 'LO drafts only' },
  { id: 'meet', lvl: 'L1' as const, tag: 'MEET→ACT', hold: 'Meeting to action' },
  { id: 'orbit', lvl: 'L1' as const, tag: 'DAY ORBIT', hold: 'Cal + WHOOP · protect gym' },
  { id: 'mail', lvl: 'L0' as const, tag: 'MAIL', hold: 'Drafts only' },
  { id: 'warm', lvl: 'L0' as const, tag: 'KILL-WARMER', hold: 'Leave-state list' },
] as const;

export const HOLD = {
  money:
    'Holding payouts, fund, SLA. Apply radar is GHL new/cold only — Brighton owns dials. No invented dollar.',
  leak:
    'Watching mortgage-feed owners, Instant Forms, dead phone. No leak proven. No invented hole.',
  type1Money: 'Holding payouts / fund / SLA. No Type-1. L0/L1 stay silent.',
  type1Leak: 'Holding feed owners · Instant Forms · dead phone. No escalate.',
  type1Wall: 'Rise ≠ Non-QM firewall. Meeting→action armed. No Type-1.',
  orbit: 'Protecting gym. Meeting→action armed. Calendar holding — no invented block.',
  whoop: 'PROTECT GYM · leave-state kill-warmer watched. No invented WHOOP.',
} as const;
