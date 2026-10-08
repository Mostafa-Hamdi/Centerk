import { read, readNumber, readString } from '@/services/normalize';
import type {
  GroupDetailsDto,
  GroupListItemDto,
  GroupStatus,
  HallOptionDto,
  WeeklySlotDto,
} from './types';

/** Live /groups, /halls responses are untyped — map known names + aliases. */
const STATUSES: readonly GroupStatus[] = ['Active', 'Paused', 'Closed'];

export function normalizeGroupRow(raw: unknown, index: number): GroupListItemDto {
  const status = readString(raw, 'status')?.toLowerCase();
  return {
    id: readString(raw, 'id', 'groupId') ?? `group-${index}`,
    name: readString(raw, 'name', 'title') ?? '—',
    subject: readString(raw, 'subject', 'subjectName', 'subject.name') ?? '',
    grade: readString(raw, 'grade', 'gradeLevel', 'gradeLevelName') ?? '',
    teacherName: readString(raw, 'teacherName', 'teacher.fullName', 'teacher.name'),
    hallName: readString(raw, 'hallName', 'hall.name'),
    capacity: readNumber(raw, 'capacity'),
    enrolledCount: readNumber(raw, 'enrolledCount', 'studentsCount', 'enrollmentsCount') ?? 0,
    price: readNumber(raw, 'price', 'monthlyPrice') ?? 0,
    status: STATUSES.find((item) => item.toLowerCase() === status) ?? 'Active',
  };
}

function normalizeSlot(raw: unknown): WeeklySlotDto {
  const time = readString(raw, 'startTime', 'start') ?? '';
  return {
    dayOfWeek: readNumber(raw, 'dayOfWeek', 'day') ?? 0,
    startTime: /(\d{2}:\d{2})/.exec(time)?.[1] ?? time,
    durationMinutes: readNumber(raw, 'durationMinutes', 'duration') ?? 90,
    hallId: readString(raw, 'hallId'),
  };
}

export function normalizeGroupDetails(raw: unknown): GroupDetailsDto {
  const schedule = read(raw, 'schedule', 'slots', 'weeklySlots');
  return {
    ...normalizeGroupRow(raw, 0),
    teacherId: readString(raw, 'teacherId', 'teacher.id'),
    hallId: readString(raw, 'hallId', 'hall.id'),
    branchId: readString(raw, 'branchId', 'branch.id'),
    schedule: Array.isArray(schedule) ? schedule.map(normalizeSlot) : [],
  };
}

export function normalizeSchedule(raw: unknown): WeeklySlotDto[] {
  const list = Array.isArray(raw) ? raw : read(raw, 'slots', 'items', 'schedule');
  return Array.isArray(list) ? list.map(normalizeSlot) : [];
}

export function normalizeHalls(raw: unknown): HallOptionDto[] {
  const list = Array.isArray(raw) ? raw : read(raw, 'items', 'data');
  if (!Array.isArray(list)) return [];
  return list.map((hall, index) => ({
    id: readString(hall, 'id') ?? `hall-${index}`,
    name: readString(hall, 'name') ?? '—',
    capacity: readNumber(hall, 'capacity'),
  }));
}
