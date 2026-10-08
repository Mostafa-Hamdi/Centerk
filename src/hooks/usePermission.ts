import {
  hasPermission,
  type PermissionCode,
  type PermissionMode,
} from '@/features/auth/permissions';
import { useAppSelector } from '@/store/hooks';

/** `usePermission('students.create')` or `usePermission(['payments.view','cash.view'], 'any')`. */
export function usePermission(
  required: PermissionCode | readonly PermissionCode[],
  mode: PermissionMode = 'all',
): boolean {
  return useAppSelector((state) => hasPermission(state.auth.me, required, mode));
}
