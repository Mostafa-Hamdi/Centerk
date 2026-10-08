import type { MeDto } from '@/features/auth/types';
import { PERMISSION_CODES } from '@/features/auth/permissions';

/**
 * DEV-ONLY demo data for the mock API (API_MOCK=true). Not real accounts.
 * Demo logins (center code / tenantSlug: demo):
 *  - Staff (دخول الفريق): phone 01000000000 · password Centerk2026
 *  - Guardian (ولي أمر): phone 01111111111 · OTP 123456
 *  - Student (طالب): code F-1024 + any valid phone · OTP 123456
 */
export const mockAccounts = {
  tenantSlug: 'demo',
  staff: { phone: '01000000000', password: 'Centerk2026' },
  guardian: { phone: '01111111111' },
  student: { studentCode: 'F-1024' },
  otp: '123456',
} as const;

const tenant = { id: 't-1', name: 'سنتر النور التعليمي', logoUrl: null, plan: 'Pro' as const };
const branches = [
  { id: 'b-1', name: 'فرع سموحة' },
  { id: 'b-2', name: 'فرع ميامي' },
];

export const mockMe: Record<MeDto['kind'], MeDto> = {
  Staff: {
    id: 'u-1',
    fullName: 'أحمد سامي عبد الله',
    phone: '+201000000000',
    avatarUrl: null,
    kind: 'Staff',
    isOwner: true,
    roles: [{ id: 'r-owner', name: 'المالك' }],
    tenant,
    branches,
    permissions: [...PERMISSION_CODES],
    dataScope: 'AllBranches',
    hidePhones: false,
  },
  Guardian: {
    id: 'g-1',
    fullName: 'إبراهيم نصر',
    phone: '+201111111111',
    avatarUrl: null,
    kind: 'Guardian',
    isOwner: false,
    roles: [{ id: 'r-guardian', name: 'ولي أمر' }],
    tenant,
    branches: [],
    permissions: [],
    dataScope: 'Self',
    hidePhones: false,
  },
  Student: {
    id: 's-1',
    fullName: 'سلمى إبراهيم نصر',
    phone: '+201067771010',
    avatarUrl: null,
    kind: 'Student',
    isOwner: false,
    roles: [{ id: 'r-student', name: 'طالب' }],
    tenant,
    branches: [],
    permissions: [],
    dataScope: 'Self',
    hidePhones: false,
  },
};
