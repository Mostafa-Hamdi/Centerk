'use client';

import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { PermissionCode, PermissionMode } from '../permissions';

interface CanProps {
  permission: PermissionCode | readonly PermissionCode[];
  mode?: PermissionMode;
  /** Rendered when the user lacks the permission (e.g. a disabled button). */
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the current user has the permission(s). */
export function Can({ permission, mode = 'all', fallback = null, children }: CanProps) {
  return usePermission(permission, mode) ? children : fallback;
}
