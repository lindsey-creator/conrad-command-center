import { createHash, randomBytes } from 'crypto';

/** Official WHOOP OAuth — https://developer.whoop.com/docs/developing/oauth/ */
export const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
export const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

/**
 * Official collection paths are /v2/recovery, /v2/cycle, /v2/activity/sleep.
 * Partner token URL on the same docs uses /developer/v2 — data calls use this base.
 * https://developer.whoop.com/api/
 */
export const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v2';

export const WHOOP_SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:profile',
  'offline',
].join(' ');

export const WHOOP_TOKEN_COOKIE = 'whoop_tokens';
export const WHOOP_STATE_COOKIE = 'whoop_oauth_state';

export type WhoopTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export type WhoopLive = {
  recovery: number | null;
  strain: number | null;
  sleep: number | null;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

type RecoveryRecord = {
  score_state?: string;
  score?: { recovery_score?: number };
};

type CycleRecord = {
  score_state?: string;
  score?: { strain?: number };
};

type SleepRecord = {
  nap?: boolean;
  score_state?: string;
  score?: { sleep_performance_percentage?: number };
};

type Collection<T> = { records?: T[] };

export function isWhoopConfigured(): boolean {
  return Boolean(
    process.env.WHOOP_CLIENT_ID &&
      process.env.WHOOP_CLIENT_SECRET &&
      process.env.WHOOP_REDIRECT_URI,
  );
}

export function randomState(): string {
  return randomBytes(8).toString('hex');
}

export function hashState(state: string): string {
  return createHash('sha256').update(state).digest('hex');
}

export function cookieSecure(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function buildAuthorizeUrl(state: string): string {
  const url = new URL(WHOOP_AUTH_URL);
  url.searchParams.set('client_id', process.env.WHOOP_CLIENT_ID ?? '');
  url.searchParams.set('redirect_uri', process.env.WHOOP_REDIRECT_URI ?? '');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', WHOOP_SCOPES);
  url.searchParams.set('state', state);
  return url.toString();
}

function form(body: Record<string, string>): URLSearchParams {
  return new URLSearchParams(body);
}

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'User-Agent': 'ConradCommandCenter/1.0',
    },
    body: form(body),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!res.ok || !data.access_token) {
    throw new Error('WHOOP token exchange failed');
  }
  return data;
}

export async function exchangeCode(code: string): Promise<WhoopTokens> {
  const data = await postToken({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.WHOOP_CLIENT_ID ?? '',
    client_secret: process.env.WHOOP_CLIENT_SECRET ?? '',
    redirect_uri: process.env.WHOOP_REDIRECT_URI ?? '',
  });
  return toTokens(data);
}

export async function refreshTokens(refreshToken: string): Promise<WhoopTokens> {
  const data = await postToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.WHOOP_CLIENT_ID ?? '',
    client_secret: process.env.WHOOP_CLIENT_SECRET ?? '',
    scope: 'offline',
  });
  return toTokens(data, refreshToken);
}

function toTokens(data: TokenResponse, fallbackRefresh?: string): WhoopTokens {
  const refresh = data.refresh_token ?? fallbackRefresh;
  if (!data.access_token || !refresh) {
    throw new Error('WHOOP token response missing tokens');
  }
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  return {
    access_token: data.access_token,
    refresh_token: refresh,
    expires_at: Date.now() + Math.max(expiresIn - 60, 30) * 1000,
  };
}

export function parseTokenCookie(value: string | undefined): WhoopTokens | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as WhoopTokens;
    if (!parsed.access_token || !parsed.refresh_token || !parsed.expires_at) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function whoopGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${WHOOP_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'User-Agent': 'ConradCommandCenter/1.0',
    },
    cache: 'no-store',
  });
  if (res.status === 401) {
    const err = new Error('WHOOP unauthorized');
    err.name = 'WhoopUnauthorized';
    throw err;
  }
  if (!res.ok) {
    throw new Error(`WHOOP ${path} ${res.status}`);
  }
  return (await res.json()) as T;
}

function scoredRecovery(row: RecoveryRecord | undefined): number | null {
  if (!row || row.score_state !== 'SCORED') return null;
  const n = row.score?.recovery_score;
  return typeof n === 'number' ? n : null;
}

function scoredStrain(row: CycleRecord | undefined): number | null {
  if (!row || row.score_state !== 'SCORED') return null;
  const n = row.score?.strain;
  return typeof n === 'number' ? n : null;
}

function scoredSleep(row: SleepRecord | undefined): number | null {
  if (!row || row.score_state !== 'SCORED') return null;
  const n = row.score?.sleep_performance_percentage;
  return typeof n === 'number' ? n : null;
}

export async function fetchWhoopLive(accessToken: string): Promise<WhoopLive> {
  const [recovery, cycle, sleep] = await Promise.all([
    whoopGet<Collection<RecoveryRecord>>('/recovery?limit=1', accessToken),
    whoopGet<Collection<CycleRecord>>('/cycle?limit=1', accessToken),
    whoopGet<Collection<SleepRecord>>('/activity/sleep?limit=5', accessToken),
  ]);

  const latestSleep =
    (sleep.records ?? []).find((row) => row.nap === false) ?? sleep.records?.[0];

  return {
    recovery: scoredRecovery(recovery.records?.[0]),
    strain: scoredStrain(cycle.records?.[0]),
    sleep: scoredSleep(latestSleep),
  };
}

export function recoveryZone(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
}
