import type { NewGroup, UpdateGroupRequest, WeeklySlot } from '@/services/generated/backend';

/** Request DTOs from the live Swagger (codegen). */
export type { NewGroup, UpdateGroupRequest, WeeklySlot };

export type GroupStatus = 'Active' | 'Paused' | 'Closed';

/** Row of GET /groups — untyped in Swagger; fields per backend-spec §8.6 / the groups screen. */
export interface GroupListItemDto {
  id: string;
  name: string;
  subject: string;
  grade: string;
  teacherName: string | null;
  hallName: string | null;
  capacity: number | null;
  enrolledCount: number;
  /** Monthly price (EGP). */
  price: number;
  status: GroupStatus;
}

export interface WeeklySlotDto {
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  /** "HH:mm" */
  startTime: string;
  durationMinutes: number;
  hallId: string | null;
}

export interface GroupDetailsDto extends GroupListItemDto {
  teacherId: string | null;
  hallId: string | null;
  branchId: string | null;
  schedule: WeeklySlotDto[];
}

export interface HallOptionDto {
  id: string;
  name: string;
  capacity: number | null;
}
