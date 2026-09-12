import type { HealthMetricsResponse } from '../api/brain';

export const WHOOP_LOW_RECOVERY = 34;

export interface WhoopDay {
  recovery: number | null;
  sleep: number | null;
  strain: number | null;
  updatedAt: string | null;
  status: string;
  proven: boolean;
  workGate: 'down' | 'open' | 'unknown';
  verdict: string;
}

export interface WhoopFeed {
  status?: string;
  sources?: string[];
  recovery?: unknown;
  sleep?: unknown;
  strain?: unknown;
  sleep_hours?: unknown;
  day_strain?: unknown;
  recovery_score?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
  as_of?: unknown;
  metrics?: Record<string, Record<string, unknown>>;
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function text(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

export function emptyWhoop(status = 'connect_source'): WhoopDay {
  return {
    recovery: null,
    sleep: null,
    strain: null,
    updatedAt: null,
    status,
    proven: false,
    workGate: 'unknown',
    verdict: 'PROTECT GYM · leave-state kill-warmer watched. No invented WHOOP.',
  };
}

export function gateWhoop(day: Omit<WhoopDay, 'workGate' | 'verdict'>): WhoopDay {
  if (!day.proven || day.recovery == null) {
    return {
      ...day,
      workGate: 'unknown',
      verdict: 'PROTECT GYM · leave-state kill-warmer watched. No invented WHOOP.',
    };
  }
  if (day.recovery < WHOOP_LOW_RECOVERY) {
    return {
      ...day,
      workGate: 'down',
      verdict: 'WORK LOAD DOWN · GYM STAYS',
    };
  }
  return {
    ...day,
    workGate: 'open',
    verdict: 'WORK OPEN · GYM STAYS',
  };
}

export function parseWhoopFeed(data: WhoopFeed | HealthMetricsResponse | null | undefined): WhoopDay {
  if (!data) return emptyWhoop();
  const raw = (data.metrics?.whoop ?? data) as WhoopFeed;
  const status = String(data.status ?? raw.status ?? 'connect_source');
  const recovery = num(raw.recovery ?? raw.recovery_score);
  const sleep = num(raw.sleep ?? raw.sleep_hours);
  const strain = num(raw.strain ?? raw.day_strain);
  const updatedAt = text(raw.updatedAt ?? raw.updated_at ?? raw.as_of);
  const proven = status !== 'connect_source' && (recovery != null || sleep != null || strain != null);
  return gateWhoop({
    recovery,
    sleep,
    strain,
    updatedAt,
    status,
    proven,
  });
}
