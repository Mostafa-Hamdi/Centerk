/** DTOs for backend-spec §6 / §10.1. Exact response shapes are not fixed by the spec — see docs/api-gaps.md #4. */

export type Plan = 'Free' | 'Solo' | 'Pro' | 'Center' | 'Enterprise';
export type DataScope = 'AllBranches' | 'OwnBranch' | 'OwnGroups' | 'Self';
export type AccountKind = 'Staff' | 'Guardian' | 'Student';
export type OtpPurpose = 'Login';

export interface BranchDto {
  id: string;
  name: string;
}

/** GET /me — profile, tenant, plan, branches, permissions, scope. */
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

/** Token pair returned by POST /auth/login, /auth/otp/verify, /auth/refresh. */
export interface BackendTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt?: string;
}

/** What the BFF hands to the browser — never contains the refresh token. */
export interface ClientSession {
  accessToken: string;
  accessTokenExpiresAt: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
  rememberMe: boolean;
}

/** POST /auth/otp/request. Guardians send `phone`; students send `studentCode` (backend-spec §6.1). */
export interface OtpRequest {
  phone?: string;
  studentCode?: string;
  purpose: OtpPurpose;
}

export interface OtpRequestResult {
  resendAfterSeconds?: number;
  maskedDestination?: string | null;
}

export interface OtpVerifyRequest extends OtpRequest {
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
