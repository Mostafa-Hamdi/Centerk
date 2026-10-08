/** Shared by middleware (edge), BFF route handlers and the client. No server-only imports here. */
export const REFRESH_COOKIE = 'ck_rt';
export const REMEMBER_COOKIE = 'ck_rm';
/** Tenant slug used for the last login — /auth/refresh requires it (live API). */
export const TENANT_COOKIE = 'ck_tn';
/** Refresh token lifetime per backend-spec §6.1 (30 days, rotating). */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** Next.js BFF routes — the only place the refresh token is ever handled. */
export const BFF = {
  login: '/api/auth/login',
  otpVerify: '/api/auth/otp/verify',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
} as const;

export const OTP_LENGTH = 6;
/** Fallback when the backend doesn't say (backend-spec §6.1: 3 sends / 15 min). */
export const OTP_RESEND_SECONDS = 60;
