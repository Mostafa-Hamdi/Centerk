import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
  REMEMBER_COOKIE,
  TENANT_COOKIE,
} from '@/features/auth/constants';
import type { ClientSession } from '@/features/auth/types';
import { ar } from '@/i18n/ar';
import { env, usesMockApi } from '@/lib/env';
import { handleMockRequest } from '@/mocks/handlers';

/** Server-side backend base; API_URL_INTERNAL lets the server use a private network address. */
const backendBase = () =>
  (process.env.API_URL_INTERNAL ?? env.NEXT_PUBLIC_API_URL).replace(/\/$/, '');

/** Swagger `AuthTokens`. */
const backendTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
  refreshExpiresAtUtc: z.string().optional(),
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
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'ar',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
  const init = { method: 'POST', headers, body: JSON.stringify(body) };
  // Demo mode: call the mock in-process (no self-request through Vercel deployment protection).
  if (usesMockApi) return handleMockRequest('POST', path, new Request(`http://mock${path}`, init));
  try {
    return await fetch(`${backendBase()}${path}`, { ...init, cache: 'no-store' });
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
  for (const name of [REFRESH_COOKIE, REMEMBER_COOKIE, TENANT_COOKIE]) {
    response.cookies.set(name, '', { ...cookieBase, maxAge: 0 });
  }
  return response;
}

/**
 * Backend `AuthTokens` → browser gets only the access token (+ computed expiry); the refresh token
 * and the tenant slug (needed by /auth/refresh) go into httpOnly cookies — persistent for
 * "remember me", session cookies otherwise.
 */
export async function sessionFromBackend(
  response: Response,
  remember: boolean,
  tenantSlug: string,
) {
  const parsed = backendTokensSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) return problem(502, 'bad-token-response', ar.errors.badGateway);

  const { accessToken, refreshToken, expiresInSeconds, refreshExpiresAtUtc } = parsed.data;
  const accessTokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  const result = NextResponse.json<ClientSession>(
    { accessToken, accessTokenExpiresAt },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  const refreshMaxAge = refreshExpiresAtUtc
    ? Math.max(0, Math.floor((Date.parse(refreshExpiresAtUtc) - Date.now()) / 1000))
    : REFRESH_COOKIE_MAX_AGE;
  const lifetime = remember ? { maxAge: refreshMaxAge || REFRESH_COOKIE_MAX_AGE } : {};
  result.cookies.set(REFRESH_COOKIE, refreshToken, { ...cookieBase, ...lifetime });
  result.cookies.set(REMEMBER_COOKIE, remember ? '1' : '0', { ...cookieBase, ...lifetime });
  result.cookies.set(TENANT_COOKIE, tenantSlug, { ...cookieBase, ...lifetime });
  return result;
}
