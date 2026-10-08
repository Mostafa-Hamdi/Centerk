import type { AccountKind, BranchDto, DataScope, MeDto, Plan } from './types';

/**
 * GET /me has no response schema in Swagger, and the live shape differs from the spec.
 * This builds a complete MeDto from whatever the API returns (known names + aliases, nested
 * `profile`/`user`/`tenant` objects) and falls back to the access-token claims, so the shell
 * (name, profile menu, logout, permissions) always works. Refine once backend-requests.md §2.4 lands.
 */
type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function read(source: unknown, paths: readonly string[]): unknown {
  for (const path of paths) {
    let current: unknown = source;
    for (const key of path.split('.')) current = isObject(current) ? current[key] : undefined;
    if (current !== undefined && current !== null && current !== '') return current;
  }
  return undefined;
}

const str = (source: unknown, ...paths: string[]) => {
  const value = read(source, paths);
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
};

const list = (source: unknown, ...paths: string[]): unknown[] => {
  const value = read(source, paths);
  if (Array.isArray(value)) return value;
  if (typeof value === 'string')
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  return [];
};

/** Decodes the JWT payload (display only — the API validates the token). */
export function decodeJwtClaims(token: string | null): Raw {
  const payload = token?.split('.')[1];
  if (!payload) return {};
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(json, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const ID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

export const ROLE_LABELS: Record<string, string> = {
  owner: 'المالك',
  branchmanager: 'مدير فرع',
  teacher: 'مدرس',
  assistant: 'مساعد',
  receptionist: 'استقبال',
  accountant: 'محاسب',
  guardian: 'ولي أمر',
  student: 'طالب',
};

const PLANS: readonly Plan[] = ['Trial', 'Free', 'Solo', 'Pro', 'Center', 'Enterprise'];
const SCOPES: readonly DataScope[] = ['AllBranches', 'OwnBranch', 'OwnGroups', 'Self'];

function toRole(value: unknown, index: number): { id: string; name: string } | null {
  if (typeof value === 'string') {
    return { id: value, name: ROLE_LABELS[value.replace(/\s/g, '').toLowerCase()] ?? value };
  }
  const name = str(value, 'name', 'title', 'code');
  if (!name) return null;
  return {
    id: str(value, 'id', 'roleId') ?? `role-${index}`,
    name: ROLE_LABELS[name.replace(/\s/g, '').toLowerCase()] ?? name,
  };
}

function toBranch(value: unknown, index: number): BranchDto | null {
  if (typeof value === 'string') return { id: value, name: `فرع ${index + 1}` };
  const id = str(value, 'id', 'branchId');
  return id ? { id, name: str(value, 'name', 'branchName', 'title') ?? `فرع ${index + 1}` } : null;
}

const warned = { me: false };

export function normalizeMe(
  raw: unknown,
  accessToken: string | null,
  hint?: { profile: Record<string, unknown> | null; tenant: Record<string, unknown> | null } | null,
): MeDto {
  const claims = decodeJwtClaims(accessToken);
  // /me first, then the profile/tenant that came with the tokens (live AuthTokens shape).
  const sources = [
    raw,
    read(raw, ['profile']),
    read(raw, ['user']),
    read(raw, ['data']),
    hint?.profile,
    hint?.tenant ? { tenant: hint.tenant } : undefined,
  ];
  const pick = (...paths: string[]) => {
    for (const source of sources) {
      const value = str(source, ...paths);
      if (value) return value;
    }
    return undefined;
  };
  const pickList = (...paths: string[]) => {
    for (const source of sources) {
      const items = list(source, ...paths);
      if (items.length) return items;
    }
    return [];
  };

  const roleSource = pickList('roles', 'roleNames', 'role');
  const roles = (roleSource.length ? roleSource : list(claims, 'role', ROLE_CLAIM, 'roles'))
    .map(toRole)
    .filter((role): role is { id: string; name: string } => role !== null);
  const roleKeys = roles.map((role) => `${role.id} ${role.name}`.toLowerCase());
  const hasRole = (key: string) =>
    roleKeys.some((role) => role.includes(key) || role.includes(ROLE_LABELS[key] ?? '§'));

  const explicitOwner = sources
    .map((source) => read(source, ['isOwner']))
    .find((value) => value !== undefined);
  const kindValue = pick('kind', 'accountType', 'userType', 'actorType')?.toLowerCase();
  const kind: AccountKind =
    kindValue === 'guardian' || (!kindValue && hasRole('guardian'))
      ? 'Guardian'
      : kindValue === 'student' || (!kindValue && hasRole('student'))
        ? 'Student'
        : 'Staff';

  const branchSource = pickList('branches', 'branchIds', 'branchId');
  const branches = (branchSource.length ? branchSource : list(claims, 'branch_ids', 'branchIds'))
    .map(toBranch)
    .filter((branch): branch is BranchDto => branch !== null);

  const permissionsRaw = sources
    .map((source) => read(source, ['permissions', 'permissionCodes']))
    .find(Boolean);
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw
        .map((item) => (typeof item === 'string' ? item : str(item, 'code')))
        .filter((item): item is string => Boolean(item))
    : isObject(permissionsRaw)
      ? Object.entries(permissionsRaw)
          .filter(([, granted]) => granted === true)
          .map(([code]) => code)
      : [];

  const plan = pick('tenant.plan', 'plan', 'planCode') ?? str(claims, 'plan');
  const scope = pick('dataScope', 'scope') ?? str(claims, 'scope');
  const hidePhones = sources
    .map((source) => read(source, ['hidePhones']))
    .find((value) => value !== undefined);

  const me: MeDto = {
    id: pick('id', 'userId', 'sub') ?? str(claims, 'sub', ID_CLAIM) ?? '',
    fullName:
      pick('fullName', 'name', 'displayName', 'userName') ??
      str(claims, 'name', NAME_CLAIM, 'unique_name') ??
      'مستخدم',
    phone: pick('phone', 'phoneNumber', 'mobile') ?? str(claims, 'phone', 'phone_number') ?? '',
    avatarUrl: pick('avatarUrl', 'photoUrl') ?? null,
    kind,
    isOwner: explicitOwner === true || hasRole('owner'),
    roles,
    tenant: {
      id: pick('tenant.id', 'tenantId') ?? str(claims, 'tenant_id', 'tenantId') ?? '',
      name: pick('tenant.name', 'tenantName', 'tenant.title') ?? '',
      logoUrl: pick('tenant.logoUrl') ?? null,
      plan: PLANS.find((item) => item.toLowerCase() === plan?.toLowerCase()) ?? 'Free',
    },
    branches,
    permissions,
    dataScope: SCOPES.find((item) => item.toLowerCase() === scope?.toLowerCase()) ?? 'OwnBranch',
    hidePhones: hidePhones === true,
  };

  if (
    !warned.me &&
    process.env.NODE_ENV !== 'production' &&
    (!read(raw, ['fullName']) || !read(raw, ['branches']))
  ) {
    warned.me = true;
    console.warn('[auth] /me: unexpected response shape — please share it to map fields', raw);
  }
  return me;
}
