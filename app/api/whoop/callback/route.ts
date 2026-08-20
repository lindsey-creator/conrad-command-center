import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  WHOOP_STATE_COOKIE,
  WHOOP_TOKEN_COOKIE,
  cookieSecure,
  exchangeCode,
  hashState,
} from '@/lib/whoop';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const home = new URL('/', origin);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const jar = await cookies();
  const expected = jar.get(WHOOP_STATE_COOKIE)?.value;

  jar.delete(WHOOP_STATE_COOKIE);

  if (!code || !state || !expected || hashState(state) !== expected) {
    return NextResponse.redirect(home);
  }

  try {
    const tokens = await exchangeCode(code);
    jar.set(WHOOP_TOKEN_COOKIE, JSON.stringify(tokens), {
      httpOnly: true,
      sameSite: 'lax',
      secure: cookieSecure(),
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch {
    return NextResponse.redirect(home);
  }

  return NextResponse.redirect(home);
}
