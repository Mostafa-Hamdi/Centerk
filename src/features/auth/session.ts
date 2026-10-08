import { routes } from '@/config/routes';
import { BFF } from './constants';
import type { ClientSession } from './types';

export type RefreshResult =
  { ok: true; session: ClientSession } | { ok: false; reason: 'unauthenticated' | 'unavailable' };

let inFlight: Promise<RefreshResult> | null = null;

async function requestRefresh(): Promise<RefreshResult> {
  try {
    const response = await fetch(BFF.refresh, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Accept-Language': 'ar' },
    });
    if (response.ok) return { ok: true, session: (await response.json()) as ClientSession };
    return { ok: false, reason: response.status === 401 ? 'unauthenticated' : 'unavailable' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

/**
 * Exchanges the httpOnly refresh cookie for a new access token via the BFF.
 * Concurrent callers share one request (refresh tokens rotate, so a second call would fail).
 */
export function refreshSession(): Promise<RefreshResult> {
  inFlight ??= requestRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Only same-app relative paths are allowed as `?next=` targets (no open redirects). */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next?.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}

export function loginUrl(next?: string): string {
  return next ? `${routes.login}?next=${encodeURIComponent(next)}` : routes.login;
}

/** Hard navigation so every in-memory trace of the session is dropped. */
export function redirectToLogin(): void {
  window.location.assign(loginUrl(window.location.pathname + window.location.search));
}
