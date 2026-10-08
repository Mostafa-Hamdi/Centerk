import type { EditStudent, NewStudent } from '@/services/generated/backend';

/** Request DTOs come straight from the live Swagger (codegen). */
export type { EditStudent, NewStudent };

/** Swagger `StudentStatusChange.status`. */
export type StudentStatus = 'Active' | 'Suspended' | 'Withdrawn' | 'Graduated';

export const STUDENT_STATUSES: readonly StudentStatus[] = [
  'Active',
  'Suspended',
  'Withdrawn',
  'Graduated',
];

/**
 * Row of GET /students — Swagger has no response schema yet (docs/api-gaps.md #1);
 * fields follow backend-spec §8.5 / the students screen.
 */
export interface StudentListItemDto {
  id: string;
  code: string;
  fullName: string;
  /** May arrive masked (e.g. 010****5678) depending on the role. */
  phone: string | null;
  grade: string | null;
  status: StudentStatus;
  guardianName: string | null;
  balance: number;
  createdAt: string;
}

export interface GuardianDto {
  id: string;
  fullName: string;
  phone: string;
  relation: string;
}

/** GET /students/{id} — "360 profile" (backend-spec §10.3). */
export interface StudentDetailsDto extends StudentListItemDto {
  branchId: string | null;
  guardians: GuardianDto[];
  attendanceRate: number | null;
  averageGrade: number | null;
  rowVersion?: string;
}
