import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { redirectToLogin, refreshSession, type RefreshResult } from '@/features/auth/session';
import { env } from '@/lib/env';
import { loggedOut, sessionReceived, type AuthState } from '@/store/authSlice';

/** `bff: true` routes the call to this app's /api/* handlers instead of the backend. */
export interface AppExtraOptions {
  bff?: boolean;
}

export type AppBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  AppExtraOptions | undefined
>;

type StateWithAuth = { auth: AuthState };

const commonHeaders = (headers: Headers, state: StateWithAuth) => {
  const token = state.auth.accessToken;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept-Language', 'ar');
  return headers;
};

const backendQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as StateWithAuth;
    commonHeaders(headers, state);
    const branchId = state.auth.currentBranchId;
    if (branchId && !headers.has('X-Branch-Id')) headers.set('X-Branch-Id', branchId);
    return headers;
  },
});

const bffQuery = fetchBaseQuery({
  baseUrl: '',
  credentials: 'same-origin',
  prepareHeaders: (headers, { getState }) => commonHeaders(headers, getState() as StateWithAuth),
});

const rawBaseQuery: AppBaseQuery = (args, api, extraOptions) =>
  extraOptions?.bff ? bffQuery(args, api, {}) : backendQuery(args, api, {});

interface ReauthDeps {
  baseQuery: AppBaseQuery;
  refresh: () => Promise<RefreshResult>;
  onSessionExpired: () => void;
}

/**
 * On a backend 401: one refresh behind a mutex → retry. Requests that fail while a refresh
 * is running wait for it and retry with the new token. If the refresh token is rejected the
 * session is cleared and the user is sent to /login?next=…. BFF calls never trigger a refresh
 * (a 401 from /api/auth/login means wrong credentials).
 */
export function createBaseQueryWithReauth({
  baseQuery,
  refresh,
  onSessionExpired,
}: ReauthDeps): AppBaseQuery {
  const mutex = new Mutex();

  return async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    const tokenUsed = (api.getState() as StateWithAuth).auth.accessToken;
    let result = await baseQuery(args, api, extraOptions);

    if (extraOptions?.bff || result.error?.status !== 401) return result;

    // Another request already refreshed (or is refreshing) since this one was sent.
    if (mutex.isLocked() || (api.getState() as StateWithAuth).auth.accessToken !== tokenUsed) {
      await mutex.waitForUnlock();
      return baseQuery(args, api, extraOptions);
    }

    const release = await mutex.acquire();
    try {
      const refreshed = await refresh();
      if (refreshed.ok) {
        api.dispatch(sessionReceived(refreshed.session));
        result = await baseQuery(args, api, extraOptions);
      } else if (refreshed.reason === 'unauthenticated') {
        api.dispatch(loggedOut());
        onSessionExpired();
      }
      // 'unavailable' (network/5xx): keep the session and return the original 401 to the caller.
    } finally {
      release();
    }
    return result;
  };
}

export const baseQueryWithReauth = createBaseQueryWithReauth({
  baseQuery: rawBaseQuery,
  refresh: refreshSession,
  onSessionExpired: redirectToLogin,
});
