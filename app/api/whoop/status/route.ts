import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  WHOOP_TOKEN_COOKIE,
  cookieSecure,
  fetchWhoopLive,
  isWhoopConfigured,
  parseTokenCookie,
  refreshTokens,
  type WhoopTokens,
} from '@/lib/whoop';

export const dynamic = 'force-dynamic';

function attachTokens(res: NextResponse, tokens: WhoopTokens) {
  res.cookies.set(WHOOP_TOKEN_COOKIE, JSON.stringify(tokens), {
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSecure(),
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

function samplePayload(configured: boolean, connected: boolean, extra?: Record<string, unknown>) {
  return NextResponse.json({
    configured,
    connected,
    source: 'sample',
    empty: false,
    recovery: null,
    strain: null,
    sleep: null,
    ...extra,
  });
}

export async function GET() {
  const configured = isWhoopConfigured();
  const jar = await cookies();
  let tokens = parseTokenCookie(jar.get(WHOOP_TOKEN_COOKIE)?.value);

  if (!configured) return samplePayload(false, false);
  if (!tokens) return samplePayload(true, false);

  try {
    const res = NextResponse.json({ ok: true });

    if (tokens.expires_at <= Date.now()) {
      tokens = await refreshTokens(tokens.refresh_token);
      attachTokens(res, tokens);
    }

    let live;
    try {
      live = await fetchWhoopLive(tokens.access_token);
    } catch (err) {
      if (err instanceof Error && err.name === 'WhoopUnauthorized') {
        tokens = await refreshTokens(tokens.refresh_token);
        attachTokens(res, tokens);
        live = await fetchWhoopLive(tokens.access_token);
      } else {
        throw err;
      }
    }

    const empty = live.recovery == null && live.strain == null && live.sleep == null;
    const body = {
      configured: true,
      connected: true,
      source: empty ? 'empty' : 'live',
      empty,
      ...live,
    };

    const out = NextResponse.json(body);
    const pending = res.cookies.get(WHOOP_TOKEN_COOKIE);
    if (pending) attachTokens(out, tokens);
    return out;
  } catch {
    const out = samplePayload(true, false);
    out.cookies.delete(WHOOP_TOKEN_COOKIE);
    return out;
  }
}
