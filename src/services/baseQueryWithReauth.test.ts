import type { BaseQueryApi, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { describe, expect, it, vi } from 'vitest';
import type { RefreshResult } from '@/features/auth/session';
import { loggedOut, sessionReceived, type AuthState } from '@/store/authSlice';
import { createBaseQueryWithReauth, type AppBaseQuery } from './baseQueryWithReauth';

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_API_URL: 'http://api.test/api/v1',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

const unauthorized = { error: { status: 401, data: null } as FetchBaseQueryError };
const ok = (data: unknown) => ({ data });

function makeApi(initialToken = 'old') {
  const state: { auth: AuthState } = {
    auth: {
      accessToken: initialToken,
      accessTokenExpiresAt: null,
      me: null,
      currentBranchId: null,
      loginHint: null,
    },
  };
  const dispatch = vi.fn((action: { type: string; payload?: unknown }) => {
    if (sessionReceived.match(action)) state.auth.accessToken = action.payload.accessToken;
    if (loggedOut.match(action)) state.auth.accessToken = null;
    return action;
  });
  const api = { getState: () => state, dispatch } as unknown as BaseQueryApi;
  return { api, dispatch, state };
}

const newSession: RefreshResult = {
  ok: true,
  session: { accessToken: 'new', accessTokenExpiresAt: '2026-10-08T10:00:00Z' },
};

/** Fake backend: 401 unless the current token is "new". */
const tokenAwareQuery = (state: { auth: AuthState }): AppBaseQuery =>
  vi.fn(() => Promise.resolve(state.auth.accessToken === 'new' ? ok('payload') : unauthorized));

describe('baseQueryWithReauth', () => {
  it('passes successful responses through without refreshing', async () => {
    const { api } = makeApi();
    const refresh = vi.fn<() => Promise<RefreshResult>>();
    const query = createBaseQueryWithReauth({
      baseQuery: vi.fn(() => Promise.resolve(ok(1))),
      refresh,
      onSessionExpired: vi.fn(),
    });
    await expect(query('/me', api, {})).resolves.toEqual(ok(1));
    expect(refresh).not.toHaveBeenCalled();
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const { api, state, dispatch } = makeApi();
    const baseQuery = tokenAwareQuery(state);
    const refresh = vi.fn(() => Promise.resolve(newSession));
    const query = createBaseQueryWithReauth({ baseQuery, refresh, onSessionExpired: vi.fn() });

    await expect(query('/students', api, {})).resolves.toEqual(ok('payload'));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(baseQuery).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(sessionReceived(newSession.session));
  });

  it('runs a single refresh for concurrent 401s', async () => {
    const { api, state } = makeApi();
    let release!: (value: RefreshResult) => void;
    const refresh = vi.fn(() => new Promise<RefreshResult>((resolve) => (release = resolve)));
    const query = createBaseQueryWithReauth({
      baseQuery: tokenAwareQuery(state),
      refresh,
      onSessionExpired: vi.fn(),
    });

    const all = Promise.all([query('/a', api, {}), query('/b', api, {}), query('/c', api, {})]);
    await vi.waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
    release(newSession);

    await expect(all).resolves.toEqual([ok('payload'), ok('payload'), ok('payload')]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('logs out and redirects when the refresh token is rejected', async () => {
    const { api, state, dispatch } = makeApi();
    const onSessionExpired = vi.fn();
    const query = createBaseQueryWithReauth({
      baseQuery: tokenAwareQuery(state),
      refresh: () => Promise.resolve({ ok: false, reason: 'unauthenticated' }),
      onSessionExpired,
    });

    await expect(query('/me', api, {})).resolves.toEqual(unauthorized);
    expect(dispatch).toHaveBeenCalledWith(loggedOut());
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the refresh endpoint is unavailable', async () => {
    const { api, state, dispatch } = makeApi();
    const onSessionExpired = vi.fn();
    const query = createBaseQueryWithReauth({
      baseQuery: tokenAwareQuery(state),
      refresh: () => Promise.resolve({ ok: false, reason: 'unavailable' }),
      onSessionExpired,
    });

    await expect(query('/me', api, {})).resolves.toEqual(unauthorized);
    expect(dispatch).not.toHaveBeenCalledWith(loggedOut());
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('never refreshes for BFF calls (401 = wrong credentials)', async () => {
    const { api } = makeApi(null as unknown as string);
    const refresh = vi.fn<() => Promise<RefreshResult>>();
    const query = createBaseQueryWithReauth({
      baseQuery: vi.fn(() => Promise.resolve(unauthorized)),
      refresh,
      onSessionExpired: vi.fn(),
    });
    await expect(query('/api/v1/auth/login', api, { bff: true })).resolves.toEqual(unauthorized);
    expect(refresh).not.toHaveBeenCalled();
  });
});
