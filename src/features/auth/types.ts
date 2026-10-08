/** Auth DTOs — aligned with the live Swagger (TeacherCenters API v1, /api/v1/auth/*). */

export type Plan = 'Free' | 'Solo' | 'Pro' | 'Center' | 'Enterprise';
export type DataScope = 'AllBranches' | 'OwnBranch' | 'OwnGroups' | 'Self';
export type AccountKind = 'Staff' | 'Guardian' | 'Student';
/** Swagger `OtpRequest.purpose`. */
export type OtpPurpose = 'guardian-login' | 'student-login';

export interface BranchDto {
  id: string;
  name: string;
}

/** GET /me — Swagger has no response schema yet (docs/api-gaps.md #6). */
export interface MeDto {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  kind: AccountKind;
  isOwner: boolean;
  roles: { id: string; name: string }[];
  tenant: { id: string; name: string; logoUrl: string | null; plan: Plan };
  branches: BranchDto[];
  permissions: string[];
  dataScope: DataScope;
  /** Role hides guardian phones — the API already masks them; UI uses this to hide copy/call actions. */
  hidePhones: boolean;
}

/** Swagger `AuthTokens` (login / otp verify / refresh). */
export interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresAtUtc: string;
}

/** What the BFF hands to the browser — never contains the refresh token. */
export interface ClientSession {
  accessToken: string;
  accessTokenExpiresAt: string;
}

/** Swagger `LoginV1` + rememberMe (BFF only). */
export interface LoginRequest {
  tenantSlug: string;
  phone: string;
  password: string;
  rememberMe: boolean;
}

/** Swagger `OtpRequest`: phone is required for both guardians and students. */
export interface OtpRequest {
  tenantSlug: string;
  phone: string;
  purpose: OtpPurpose;
  studentCode?: string;
}

/** POST /auth/otp/request response — no Swagger schema; `challengeId` feeds OtpVerify. */
export interface OtpRequestResult {
  challengeId?: string;
  resendAfterSeconds?: number;
  maskedDestination?: string | null;
}

/** Swagger `OtpVerify` + rememberMe (BFF only). */
export interface OtpVerifyRequest {
  tenantSlug: string;
  challengeId?: string;
  phone: string;
  purpose: OtpPurpose;
  code: string;
  rememberMe: boolean;
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
