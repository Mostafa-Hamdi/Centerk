import type { NextRequest } from 'next/server';
import { REFRESH_COOKIE, REMEMBER_COOKIE, TENANT_COOKIE } from '@/features/auth/constants';
import { ar } from '@/i18n/ar';
import {
  callBackend,
  clearSessionCookies,
  isSameOrigin,
  problem,
  relay,
  sessionFromBackend,
  unreachable,
} from '../_lib/bff';

/**
 * Rotates the refresh token (Swagger `RefreshRequest`: tenantSlug + refreshToken).
 * Rejected token → cookies cleared + 401 (client logs out). Backend down → 502, cookie kept.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return problem(403, 'forbidden', ar.errors.forbidden);
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const tenantSlug = request.cookies.get(TENANT_COOKIE)?.value;
  if (!refreshToken || !tenantSlug) {
    return clearSessionCookies(problem(401, 'session-expired', ar.errors.unauthorized));
  }

  const response = await callBackend('/auth/refresh', { tenantSlug, refreshToken });
  if (!response) return unreachable();
  if (response.status === 400 || response.status === 401 || response.status === 403) {
    return clearSessionCookies(problem(401, 'session-expired', ar.errors.unauthorized));
  }
  if (!response.ok) return relay(response);
  const remember = request.cookies.get(REMEMBER_COOKIE)?.value === '1';
  return sessionFromBackend(response, remember, tenantSlug);
}
