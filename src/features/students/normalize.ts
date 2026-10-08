import { read, readNumber, readString, warnShape } from '@/services/normalize';
import {
  STUDENT_STATUSES,
  type GuardianDto,
  type StudentDetailsDto,
  type StudentListItemDto,
  type StudentStatus,
} from './types';

/** Live GET /students(/id) are untyped — map known names + aliases (backend-requests.md §4.2). */
function toStatus(value: string | null): StudentStatus {
  const match = STUDENT_STATUSES.find((status) => status.toLowerCase() === value?.toLowerCase());
  return match ?? 'Active';
}

export function normalizeStudentRow(raw: unknown, index: number): StudentListItemDto {
  return {
    id: readString(raw, 'id', 'studentId') ?? `row-${index}`,
    code: readString(raw, 'code', 'studentCode') ?? '—',
    fullName: readString(raw, 'fullName', 'name') ?? '—',
    phone: readString(raw, 'phone', 'phoneNumber', 'mobile'),
    grade: readString(raw, 'grade', 'gradeLevel', 'gradeLevelName', 'gradeLevel.name'),
    status: toStatus(readString(raw, 'status')),
    guardianName: readString(
      raw,
      'guardianName',
      'guardian.fullName',
      'guardians.0.fullName',
      'primaryGuardian.fullName',
    ),
    balance: readNumber(raw, 'balance', 'openBalance', 'dueAmount') ?? 0,
    createdAt: readString(raw, 'createdAt', 'createdAtUtc') ?? '',
  };
}

function normalizeGuardian(raw: unknown, index: number): GuardianDto {
  return {
    id: readString(raw, 'id', 'guardianId') ?? `guardian-${index}`,
    fullName: readString(raw, 'fullName', 'name') ?? '—',
    phone: readString(raw, 'phone', 'phoneNumber') ?? '',
    relation: readString(raw, 'relation', 'relationship') ?? '',
  };
}

export function normalizeStudentDetails(raw: unknown): StudentDetailsDto {
  const guardians = read(raw, 'guardians');
  const single = read(raw, 'guardian');
  if (!readString(raw, 'id') || !readString(raw, 'fullName')) warnShape('students/{id}', raw);
  return {
    ...normalizeStudentRow(raw, 0),
    branchId: readString(raw, 'branchId', 'branch.id'),
    guardians: Array.isArray(guardians)
      ? guardians.map(normalizeGuardian)
      : single
        ? [normalizeGuardian(single, 0)]
        : [],
    attendanceRate: (() => {
      const rate = readNumber(raw, 'attendanceRate', 'attendance.rate');
      return rate === null ? null : rate > 1 ? rate / 100 : rate;
    })(),
    averageGrade: readNumber(raw, 'averageGrade', 'avgGrade', 'grades.average'),
    rowVersion: readString(raw, 'rowVersion') ?? undefined,
  };
}
