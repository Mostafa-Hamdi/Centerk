'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pause, Pencil, Play } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { routes } from '@/config/routes';
import { usePermission } from '@/hooks/usePermission';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { GroupListItemDto, GroupStatus } from './types';

const t = ar.groups;

const statusTone: Record<GroupStatus, 'success' | 'warning' | 'neutral'> = {
  Active: 'success',
  Paused: 'warning',
  Closed: 'neutral',
};

const iconAction =
  'flex size-9 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-primary';

/** Memoized columns for the groups table. */
export function useGroupColumns(onTogglePause: (group: GroupListItemDto) => void) {
  const canEdit = usePermission('groups.update');

  return useMemo<ColumnDef<GroupListItemDto>[]>(
    () => [
      {
        id: 'group',
        header: t.columns.group,
        cell: ({ row }) => (
          <Link
            href={routes.groups.detail(row.original.id)}
            className="flex flex-col hover:text-primary"
          >
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted">
              {row.original.subject} · {row.original.grade}
            </span>
          </Link>
        ),
      },
      {
        accessorKey: 'teacherName',
        header: t.columns.teacher,
        cell: ({ getValue }) => getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'hallName',
        header: t.columns.hall,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) => getValue<string | null>() ?? '—',
      },
      {
        id: 'enrolled',
        header: t.columns.enrolled,
        meta: { className: 'tabular' },
        cell: ({ row }) => {
          const { enrolledCount, capacity } = row.original;
          const full = capacity !== null && enrolledCount >= capacity;
          return (
            <span className={cn(full && 'font-semibold text-danger')}>
              {t.seats(enrolledCount, capacity)}
            </span>
          );
        },
      },
      {
        accessorKey: 'price',
        header: t.columns.price,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'status',
        header: t.columns.status,
        cell: ({ getValue }) => {
          const status = getValue<GroupStatus>();
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
        cell: ({ row }) => {
          const paused = row.original.status === 'Paused';
          return (
            <div
              role="group"
              aria-label={`${ar.list.actions} ${row.original.name}`}
              className="flex items-center justify-end gap-1 md:opacity-0 md:group-focus-within/row:opacity-100 md:group-hover/row:opacity-100"
            >
              <Link
                href={routes.groups.detail(row.original.id)}
                className={iconAction}
                aria-label={ar.common.view}
              >
                <Eye className="size-4" aria-hidden />
              </Link>
              {canEdit ? (
                <>
                  <Link
                    href={routes.groups.edit(row.original.id)}
                    className={iconAction}
                    aria-label={ar.common.edit}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onTogglePause(row.original)}
                    className={cn(iconAction, 'hover:text-warning')}
                    aria-label={paused ? t.resume : t.pause}
                  >
                    {paused ? (
                      <Play className="size-4" aria-hidden />
                    ) : (
                      <Pause className="size-4" aria-hidden />
                    )}
                  </button>
                </>
              ) : null}
            </div>
          );
        },
      },
    ],
    [canEdit, onTogglePause],
  );
}
