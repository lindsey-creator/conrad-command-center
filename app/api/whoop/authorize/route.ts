import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  WHOOP_STATE_COOKIE,
  buildAuthorizeUrl,
  cookieSecure,
  hashState,
  isWhoopConfigured,
  randomState,
} from '@/lib/whoop';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  if (!isWhoopConfigured()) {
    return NextResponse.redirect(new URL('/', origin));
  }

  const state = randomState();
  const jar = await cookies();
  jar.set(WHOOP_STATE_COOKIE, hashState(state), {
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSecure(),
    path: '/',
    maxAge: 600,
  });

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
