import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { REFRESH_COOKIE, REFRESH_COOKIE_MAX_AGE, REMEMBER_COOKIE } from '@/features/auth/constants';
import type { ClientSession } from '@/features/auth/types';
import { ar } from '@/i18n/ar';

/** Server-side backend base; API_URL_INTERNAL lets the server use a private network address. */
const backendBase = () =>
  (process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

const backendTokensSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.string(),
  refreshToken: z.string().min(1),
});

export function problem(status: number, code: string, title: string) {
  return NextResponse.json(
    { type: 'about:blank', title, status, code },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

/** Blocks cross-site POSTs to cookie-authenticated endpoints (CSRF). */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') !== 'cross-site';
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** POSTs JSON to the backend. Returns null if the backend is unreachable. */
export async function callBackend(
  path: string,
  body: unknown,
  accessToken?: string | null,
): Promise<Response | null> {
  try {
    return await fetch(`${backendBase()}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'ar',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

/** Passes a backend error through unchanged (ProblemDetails). */
export async function relay(response: Response) {
  const text = await response.text();
  return new NextResponse(text || null, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/problem+json' },
  });
}

export const unreachable = () => problem(502, 'backend-unreachable', ar.errors.badGateway);

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, '', { ...cookieBase, maxAge: 0 });
  response.cookies.set(REMEMBER_COOKIE, '', { ...cookieBase, maxAge: 0 });
  return response;
}

/**
 * Backend token response → browser gets only the access token; the refresh token goes into an
 * httpOnly cookie (persistent for "remember me", session cookie otherwise).
 */
export async function sessionFromBackend(response: Response, remember: boolean) {
  const parsed = backendTokensSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) return problem(502, 'bad-token-response', ar.errors.badGateway);

  const { accessToken, accessTokenExpiresAt, refreshToken } = parsed.data;
  const result = NextResponse.json<ClientSession>(
    { accessToken, accessTokenExpiresAt },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  const lifetime = remember ? { maxAge: REFRESH_COOKIE_MAX_AGE } : {};
  result.cookies.set(REFRESH_COOKIE, refreshToken, { ...cookieBase, ...lifetime });
  result.cookies.set(REMEMBER_COOKIE, remember ? '1' : '0', { ...cookieBase, ...lifetime });
  return result;
}
