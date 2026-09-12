import {
  brain,
  type ChatResponse,
  type ConnectSourceResponse,
  type GhlCrmResponse,
  type HealthMetricsResponse,
  type MoneyMove,
  type TeamPulseResponse,
} from '../api/brain';
import { hasLiveData, itemLabel } from './renderItems';

export type IntentKind =
  | 'leaking'
  | 'apply_fills'
  | 'rise'
  | 'lo_outreach'
  | 'money'
  | 'efficiency'
  | 'whoop'
  | 'calendar'
  | 'town'
  | 'chat';

export interface ResolvedIntent {
  kind: IntentKind;
  wantsDraft: boolean;
  label: string;
}

export const COMMAND_CHIPS: Array<{ label: string; fill: string }> = [
  { label: "What's leaking", fill: "what's leaking" },
  { label: 'Apply fills', fill: 'apply fills' },
  { label: 'Rise status', fill: 'Rise status' },
  { label: 'Draft LO outreach', fill: 'draft LO outreach' },
];

export function resolveCommandIntent(text: string, wantsDraft = false): ResolvedIntent {
  const q = text.trim().toLowerCase();

  if (/(draft|write|compose).*(lo|loan.?officer|originator)|lo outreach|draft lo/.test(q)) {
    return { kind: 'lo_outreach', wantsDraft: true, label: 'Draft LO outreach' };
  }
  if (/(leak|leaking|watch.?list|what.?s biting)/.test(q)) {
    return { kind: 'leaking', wantsDraft, label: "What's leaking" };
  }
  if (/(apply fill|ghl|go.?high|application|new lead)/.test(q)) {
    return { kind: 'apply_fills', wantsDraft, label: 'Apply fills' };
  }
  if (/\brise\b|qm board/.test(q)) {
    return { kind: 'rise', wantsDraft, label: 'Rise QM board' };
  }
  if (/(money now|top.?move|capital|cash)/.test(q)) {
    return { kind: 'money', wantsDraft, label: 'MONEY NOW' };
  }
  if (/(efficien|team pulse|who.?s behind|overdue)/.test(q)) {
    return { kind: 'efficiency', wantsDraft, label: 'EFFICIENCY' };
  }
  if (/(whoop|recovery|hrv|strain)/.test(q)) {
    return { kind: 'whoop', wantsDraft, label: 'WHOOP recovery' };
  }
  if (/(calendar|next meeting|schedule|week ahead)/.test(q)) {
    return { kind: 'calendar', wantsDraft, label: 'Calendar next' };
  }
  if (/(town|inbox|gmail|radar)/.test(q)) {
    return { kind: 'town', wantsDraft, label: 'Town / inbox radar' };
  }

  return { kind: 'chat', wantsDraft, label: 'Command' };
}

function connectNote(sources: string[]): string {
  if (!sources.length) return 'Connect source — Brain has no live payload for this lane.';
  return `Connect source: ${sources.join(', ')} — JARVIS will not invent the numbers.`;
}

function firstLines(items: unknown[], limit = 4): string {
  return items
    .slice(0, limit)
    .map((item) => `• ${itemLabel(item)}`)
    .join('\n');
}

function matchKeywords(items: unknown[], keywords: string[]): unknown[] {
  return items.filter((item) => {
    const text = itemLabel(item).toLowerCase();
    return keywords.some((k) => text.includes(k));
  });
}

function chatPayload(partial: Partial<ChatResponse> & { answer: string }): ChatResponse {
  return {
    answer: partial.answer,
    draft: partial.draft ?? null,
    note: partial.note,
    mode: partial.mode ?? 'intent',
    requires_approval: partial.requires_approval,
    approval_id: partial.approval_id,
    error: partial.error,
  };
}

export async function runCommandIntent(
  text: string,
  wantsDraft = false,
): Promise<ChatResponse> {
  const intent = resolveCommandIntent(text, wantsDraft);

  switch (intent.kind) {
    case 'leaking': {
      const watch = await brain.watchlist();
      if (!hasLiveData(watch) || !(watch.items ?? []).length) {
        return chatPayload({
          answer: connectNote(watch.sources ?? ['brain_scan', 'clickup']),
          mode: 'leaking',
          note: 'Type-1 · LEAKING',
        });
      }
      return chatPayload({
        answer: `LEAKING — ${watch.items!.length} watch items:\n${firstLines(watch.items!)}`,
        mode: 'leaking',
        note: 'Type-1 · LEAKING',
      });
    }
    case 'money': {
      const moves = await brain.topMoves(3);
      if (!hasLiveData(moves) || !moves.moves.length) {
        return chatPayload({
          answer: connectNote(moves.sources ?? ['clickup', 'ghl']),
          mode: 'money_now',
          note: 'Type-1 · MONEY NOW',
        });
      }
      const lines = moves.moves
        .slice(0, 3)
        .map((m: MoneyMove) => `• ${m.title} — ${m.why}`)
        .join('\n');
      return chatPayload({
        answer: `MONEY NOW — top moves:\n${lines}`,
        mode: 'money_now',
        note: 'Type-1 · MONEY NOW',
      });
    }
    case 'efficiency': {
      const pulse: TeamPulseResponse = await brain.teamPulse();
      if (!hasLiveData(pulse) || (!pulse.gaps.length && !pulse.overdue.length)) {
        return chatPayload({
          answer: connectNote(pulse.sources ?? ['clickup']),
          mode: 'efficiency',
          note: 'Type-1 · EFFICIENCY',
        });
      }
      const gapLines = pulse.gaps
        .slice(0, 3)
        .map((g) => `• ${g.person}: ${g.committed} → ${g.actual}`)
        .join('\n');
      const late = pulse.overdue
        .slice(0, 3)
        .map((o) => `• ${o.person} — ${o.task} (${o.days_late}d late)`)
        .join('\n');
      return chatPayload({
        answer: `EFFICIENCY\n${gapLines || 'No gaps.'}\n${late ? `\nOverdue:\n${late}` : ''}`,
        mode: 'efficiency',
        note: 'Type-1 · EFFICIENCY',
      });
    }
    case 'apply_fills': {
      const ghl: GhlCrmResponse = await brain.ghlCrm();
      if (!hasLiveData(ghl)) {
        return chatPayload({
          answer: connectNote(ghl.sources ?? ['ghl']),
          mode: 'apply_fills',
          note: 'GHL apply fills',
        });
      }
      const leads = ghl.leads?.length ? firstLines(ghl.leads) : '';
      return chatPayload({
        answer: `Apply fills — new ${ghl.new_leads ?? 0} · missed ${ghl.missed_calls ?? 0} · unread ${ghl.unread_texts ?? 0}${leads ? `\n${leads}` : ''}`,
        mode: 'apply_fills',
        note: 'GHL personal apply',
      });
    }
    case 'whoop': {
      const health: HealthMetricsResponse = await brain.healthMetrics();
      const whoop = health.metrics?.whoop;
      if (!hasLiveData(health) || !whoop) {
        return chatPayload({
          answer: connectNote(health.sources ?? ['whoop']),
          mode: 'whoop',
          note: 'WHOOP recovery',
        });
      }
      return chatPayload({
        answer: `WHOOP — recovery ${String(whoop.recovery_score ?? '—')} · HRV ${String(whoop.hrv ?? '—')} · strain ${String(whoop.strain ?? '—')}. Display only — not medical advice.`,
        mode: 'whoop',
        note: 'WHOOP recovery',
      });
    }
    case 'calendar': {
      const brief = await brain.dailyBrief();
      const week = await brain.weekAhead();
      const today = brief.today_schedule;
      const todayLive = hasLiveData(today) && (today.items?.length ?? 0) > 0;
      const weekLive = hasLiveData(week) && (week.items?.length ?? 0) > 0;
      if (!todayLive && !weekLive) {
        const sources = today?.sources?.length ? today.sources : week.sources ?? ['google_calendar'];
        return chatPayload({
          answer: connectNote(sources),
          mode: 'calendar',
          note: 'Calendar next',
        });
      }
      const block = todayLive ? today.items! : week.items!;
      return chatPayload({
        answer: `Calendar next:\n${firstLines(block)}`,
        mode: 'calendar',
        note: 'Calendar next',
      });
    }
    case 'town': {
      const radar = await brain.inboxRadar();
      if (!hasLiveData(radar) || !(radar.items ?? []).length) {
        return chatPayload({
          answer: connectNote(radar.sources ?? ['gmail', 'town']),
          mode: 'town',
          note: 'Town / inbox radar',
        });
      }
      return chatPayload({
        answer: `Town / inbox:\n${firstLines(radar.items!)}`,
        mode: 'town',
        note: 'Town / inbox radar',
      });
    }
    case 'rise':
    case 'lo_outreach': {
      const [watch, blind] = await Promise.all([brain.watchlist(), brain.blindspots()]);
      const keywords =
        intent.kind === 'rise'
          ? ['rise', 'qm', 'conventional']
          : ['non-qm', 'nonqm', 'lo hunt', 'loan officer', 'originator'];
      const pool = [...(watch.items ?? []), ...(blind.items ?? [])];
      const hits = matchKeywords(pool, keywords);
      const live = (hasLiveData(watch) || hasLiveData(blind)) && hits.length > 0;
      if (intent.kind === 'lo_outreach') {
        try {
          const res = await brain.chat({
            message: text,
            wants_draft: true,
          });
          return {
            ...res,
            mode: res.mode ?? 'lo_outreach',
            note: res.note ?? 'Draft LO outreach — Approval Queue before send.',
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Chat lane timed out';
          return chatPayload({
            answer: `${msg}\n\nDraft LO outreach needs Brain /chat (Anthropic). Queue a ClickUp task or retry when the model lane is live. Nothing sends without Approval Queue.`,
            mode: 'lo_outreach',
            note: 'Draft LO outreach — chat lane not live',
          });
        }
      }
      if (!live) {
        const sources = [
          ...(((watch as ConnectSourceResponse).sources ?? [])),
          ...(((blind as ConnectSourceResponse).sources ?? [])),
          'clickup',
        ];
        return chatPayload({
          answer: connectNote([...new Set(sources)]),
          mode: 'rise',
          note: 'Rise QM board',
        });
      }
      return chatPayload({
        answer: `Rise QM board:\n${firstLines(hits)}`,
        mode: 'rise',
        note: 'Rise QM board',
      });
    }
    default: {
      try {
        return await brain.chat({
          message: text,
          wants_draft: wantsDraft,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Chat lane timed out';
        return chatPayload({
          answer: `${msg}\n\nUse a Type-1 chip (leaking / apply fills / Rise / LO outreach) — those hit live Brain reads without the model lane.`,
          mode: 'chat',
          note: 'Command fallback',
        });
      }
    }
  }
}
