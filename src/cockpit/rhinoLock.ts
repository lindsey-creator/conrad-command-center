import { itemLabel } from '../utils/renderItems';

/** Sacred Type-1 queue — HUD shows only these cards. */
export const TYPE1_QUEUE_CAP = 3;
export const TYPE1_LANES = ['MONEY NOW', 'LEAKING', 'EFFICIENCY'] as const;
export type Type1Lane = (typeof TYPE1_LANES)[number];

export interface FeedLine {
  id: 'town' | 'ghl' | 'rise' | 'nonqm';
  name: string;
  line: string;
  proven: boolean;
  command: string;
}

function blob(item: unknown): string {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    const o = item as Record<string, unknown>;
    return [o.title, o.detail, o.source, o.status, o.tag, o.tags, o.kind, o.type, o.stage, o.milestone]
      .flat()
      .map((v) => (v == null ? '' : String(v)))
      .join(' ');
  }
  return String(item);
}

/** Town.com — pattern-match hits only. */
export function isTownPattern(item: unknown): boolean {
  const text = blob(item);
  const source = String((item as { source?: string })?.source ?? '').toLowerCase();
  if (source && source !== 'town' && source !== 'pattern' && source !== 'match') return false;
  return /\b(pattern|match|matched|radar|hit|signal|keyword|alert)\b/i.test(text);
}

/** GHL — new / cold apply fills only. Personal location. */
export function isGhlApplyFill(item: unknown): boolean {
  const text = blob(item);
  return /\b(new|cold|apply|application|fill|fills)\b/i.test(text);
}

/** Rise — QM weekly blockers only. Never a sleep score. */
export function isRiseQmBlocker(item: unknown): boolean {
  const text = blob(item);
  if (/\b(sleep|score|hours|rem|recovery)\b/i.test(text) && !/\b(qm|blocker)\b/i.test(text)) return false;
  return /\b(qm|qualified mortgage|weekly blocker|blocker|blockers)\b/i.test(text);
}

/** Non-QM — milestones only. */
export function isNonQmMilestone(item: unknown): boolean {
  const text = blob(item);
  return /\b(milestone|gate|clear to close|ctc|underwrit|docs in|funded|closing)\b/i.test(text);
}

export function townFeed(items: unknown[] | undefined, live: boolean): FeedLine {
  const hits = (items ?? []).filter(isTownPattern);
  const first = hits[0];
  return {
    id: 'town',
    name: 'TOWN',
    proven: live && hits.length > 0,
    line: live
      ? first
        ? itemLabel(first)
        : 'No Town pattern-match.'
      : 'Town pattern-match dark — no invented radar.',
    command: 'Town pattern-match only — what hit needs me?',
  };
}

export function ghlFeed(
  leads: unknown[] | undefined,
  newLeads: number | undefined,
  live: boolean,
): FeedLine {
  const fills = (leads ?? []).filter(isGhlApplyFill);
  const first = fills[0];
  const count = fills.length || (live && newLeads ? newLeads : 0);
  return {
    id: 'ghl',
    name: 'GHL APPLY',
    proven: live && (fills.length > 0 || (newLeads ?? 0) > 0),
    line: live
      ? first
        ? itemLabel(first)
        : count
          ? `${count} new/cold apply fill${count === 1 ? '' : 's'}.`
          : 'No new/cold apply fill.'
      : 'GHL new/cold apply fills only — personal location. 216-250-9078.',
    command: 'GHL apply: new or cold fills only. Who needs a move?',
  };
}

export function riseFeed(items: unknown[] | undefined, live: boolean): FeedLine {
  const blockers = (items ?? []).filter(isRiseQmBlocker);
  const first = blockers[0];
  return {
    id: 'rise',
    name: 'RISE QM',
    proven: live && blockers.length > 0,
    line: live
      ? first
        ? itemLabel(first)
        : 'No QM weekly blocker on Rise.'
      : 'Rise QM weekly blockers only — no invented sleep score.',
    command: 'Rise: QM weekly blockers only. What is stuck?',
  };
}

export function nonqmFeed(moves: unknown[] | undefined, live: boolean): FeedLine {
  const marks = (moves ?? []).filter(isNonQmMilestone);
  const first = marks[0];
  return {
    id: 'nonqm',
    name: 'NON-QM',
    proven: live && marks.length > 0,
    line: live
      ? first
        ? itemLabel(first)
        : 'No Non-QM milestone.'
      : 'Non-QM milestones only — engine narrates, never invents.',
    command: 'Non-QM milestones only — which file moved a gate?',
  };
}

export function capType1<T>(rows: T[]): T[] {
  return rows.slice(0, TYPE1_QUEUE_CAP);
}
