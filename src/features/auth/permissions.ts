import type { MeDto } from './types';

const crud = <M extends string>(module: M) =>
  [
    `${module}.view`,
    `${module}.create`,
    `${module}.update`,
    `${module}.delete`,
    `${module}.export`,
  ] as const;

/** Permission catalogue — backend-spec §6.3. */
export const PERMISSION_CODES = [
  ...crud('students'),
  'students.import',
  'students.viewGuardianPhones',
  ...crud('groups'),
  'sessions.manage',
  'halls.manage',
  ...crud('attendance'),
  'attendance.closeSession',
  'attendance.reopenSession',
  'attendance.overrideBlock',
  ...crud('quizzes'),
  'quizzes.publish',
  'grades.editAfterPublish',
  ...crud('questions'),
  'onlineExams.manage',
  ...crud('payments'),
  'payments.void',
  'payments.discountOverLimit',
  ...crud('cash'),
  'cash.closeShift',
  'expenses.approve',
  ...crud('materials'),
  ...crud('messages'),
  'messages.bulkSend',
  ...crud('content'),
  ...crud('staff'),
  'payroll.pay',
  'reports.view',
  'reports.export',
  'reports.schedule',
  'settings.view',
  'settings.update',
  'roles.manage',
  'billing.manage',
  'audit.view',
  'audit.export',
  'centers.halls',
  'centers.teachers',
  'centers.settle',
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];
export type PermissionMode = 'all' | 'any';

/** Owner short-circuits to allow-all (backend-spec §6.2). */
export function hasPermission(
  me: MeDto | null,
  required: PermissionCode | readonly PermissionCode[],
  mode: PermissionMode = 'all',
): boolean {
  if (!me) return false;
  if (me.isOwner) return true;
  const codes: readonly PermissionCode[] = typeof required === 'string' ? [required] : required;
  const check = (code: PermissionCode) => me.permissions.includes(code);
  return mode === 'all' ? codes.every(check) : codes.some(check);
}
