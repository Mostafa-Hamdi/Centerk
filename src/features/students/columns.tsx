'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { routes } from '@/config/routes';
import { usePermission } from '@/hooks/usePermission';
import { ar } from '@/i18n/ar';
import { formatMoney, formatPhone } from '@/lib/format';
import type { StudentListItemDto, StudentStatus } from './types';

const t = ar.students;

const statusTone: Record<StudentStatus, 'success' | 'warning' | 'neutral' | 'info'> = {
  Active: 'success',
  Suspended: 'warning',
  Withdrawn: 'neutral',
  Graduated: 'info',
};

const iconAction =
  'flex size-9 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-primary';

/** Memoized column definitions for the students table. */
export function useStudentColumns(onDelete: (student: StudentListItemDto) => void) {
  const canEdit = usePermission('students.update');
  const canDelete = usePermission('students.delete');

  return useMemo<ColumnDef<StudentListItemDto>[]>(
    () => [
      {
        id: 'student',
        header: t.columns.student,
        cell: ({ row }) => (
          <Link
            href={routes.students.detail(row.original.id)}
            className="flex flex-col hover:text-primary"
          >
            <span className="font-medium">{row.original.fullName}</span>
            <span className="text-xs text-muted tabular" dir="ltr">
              {row.original.code}
            </span>
          </Link>
        ),
      },
      {
        accessorKey: 'phone',
        header: t.columns.phone,
        cell: ({ getValue }) => {
          const phone = getValue<string | null>();
          return phone ? (
            <span className="tabular" dir="ltr">
              {formatPhone(phone)}
            </span>
          ) : (
            <span className="text-muted">—</span>
          );
        },
      },
      { accessorKey: 'grade', header: t.columns.grade, meta: { hideOnMobile: true } },
      { accessorKey: 'guardianName', header: t.columns.guardian, meta: { hideOnMobile: true } },
      {
        accessorKey: 'balance',
        header: t.columns.balance,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => {
          const balance = getValue<number>();
          return balance > 0 ? (
            <Badge tone="warning">{formatMoney(balance)}</Badge>
          ) : (
            <span className="text-sm text-muted">{t.noBalance}</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t.columns.status,
        cell: ({ getValue }) => {
          const status = getValue<StudentStatus>();
          return (
            <Badge tone={statusTone[status]} dot>
              {t.status[status]}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{ar.list.actions}</span>,
        meta: { label: ar.list.actions, className: 'w-px' },
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-focus-within/row:opacity-100 md:group-hover/row:opacity-100"
            aria-label={t.rowActions(row.original.fullName)}
            role="group"
          >
            <Link
              href={routes.students.detail(row.original.id)}
              className={iconAction}
              aria-label={ar.common.view}
            >
              <Eye className="size-4" aria-hidden />
            </Link>
            {canEdit ? (
              <Link
                href={routes.students.edit(row.original.id)}
                className={iconAction}
                aria-label={ar.common.edit}
              >
                <Pencil className="size-4" aria-hidden />
              </Link>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete(row.original)}
                className={`${iconAction} hover:text-danger`}
                aria-label={t.archive}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [canEdit, canDelete, onDelete],
  );
}
