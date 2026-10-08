import { NextResponse, type NextRequest } from 'next/server';
import { REFRESH_COOKIE } from '@/features/auth/constants';
import { ar } from '@/i18n/ar';
import { callBackend, clearSessionCookies, isSameOrigin, problem } from '../_lib/bff';

/** Revokes the refresh token on the backend (best effort) and always clears the cookies. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return problem(403, 'forbidden', ar.errors.forbidden);
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null;
  if (refreshToken) await callBackend('/auth/logout', { refreshToken }, accessToken);
  return clearSessionCookies(new NextResponse(null, { status: 204 }));
}
