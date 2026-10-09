'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pause, Pencil, Play, Plus, Trash2, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { formatPhone } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { STAFF_ROLES, useGetStaffQuery, useStaffActionMutation, type StaffDto } from '../api';
import { StaffHeader } from './StaffHeader';

const t = ar.staff;
const ALL = 'all';

type Pending = { member: StaffDto; action: 'suspend' | 'delete' };

/** /staff — team list: search + role filter (URL), suspend / activate, delete. */
export function StaffListPage() {
  const list = useListQueryParams();
  const role = STAFF_ROLES.find((value) => value === list.params.filters.role);
  const { data, isLoading, isFetching, error, refetch } = useGetStaffQuery({
    ...list.params,
    filters: {},
    role,
  });
  const [run] = useStaffActionMutation();
  const [pending, setPending] = useState<Pending | null>(null);

  const columns = useMemo<ColumnDef<StaffDto>[]>(() => {
    const activate = async (member: StaffDto) => {
      try {
        await run({ id: member.id, action: 'activate' }).unwrap();
        toast.success(t.activated, member.name);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      { accessorKey: 'name', header: t.columns.name },
      {
        accessorKey: 'phone',
        header: t.columns.phone,
        cell: ({ getValue }) =>
          getValue<string | null>() ? (
            <span dir="ltr" className="tabular">
              {formatPhone(getValue<string>())}
            </span>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'role',
        header: t.columns.role,
        cell: ({ getValue }) => t.roles[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'isActive',
        header: t.columns.status,
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <Badge tone="success" dot>
              {t.active}
            </Badge>
          ) : (
            <Badge tone="danger" dot>
              {t.suspended}
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => {
          const member = row.original;
          if (member.role === 'Owner') return null;
          return (
            <div className="flex gap-1">
              <Can permission="staff.update">
                <Link
                  href={routes.staff.edit(member.id)}
                  aria-label={`${ar.common.edit} ${member.name}`}
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
                {member.isActive ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${t.suspend} ${member.name}`}
                    iconStart={<Pause aria-hidden />}
                    onClick={() => setPending({ member, action: 'suspend' })}
                  />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${t.activate} ${member.name}`}
                    iconStart={<Play aria-hidden />}
                    onClick={() => void activate(member)}
                  />
                )}
              </Can>
              <Can permission="staff.delete">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`${ar.common.delete} ${member.name}`}
                  iconStart={<Trash2 aria-hidden />}
                  onClick={() => setPending({ member, action: 'delete' })}
                />
              </Can>
            </div>
          );
        },
      },
    ];
  }, [run]);

  const suspending = pending?.action === 'suspend';

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <StaffHeader
        action={
          <Can permission="staff.create">
            <Link
              href={routes.staff.new}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Plus className="size-4" aria-hidden />
              {t.add}
            </Link>
          </Can>
        }
      />
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.params.search ?? ''}
            onSearch={list.setSearch}
            placeholder={t.searchPlaceholder}
            className="w-full max-w-sm"
          />
          <div className="w-full sm:w-48">
            <Select
              aria-label={t.columns.role}
              value={role ?? ALL}
              onValueChange={(value) => list.setFilter('role', value === ALL ? null : value)}
              options={[
                { value: ALL, label: t.allRoles },
                ...STAFF_ROLES.map((value) => ({ value, label: t.roles[value] ?? value })),
              ]}
            />
          </div>
        </div>
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={UserCog} title={t.empty} />}
        />
        {data && data.totalCount > 0 ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={list.params.pageSize}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        ) : null}
      </section>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={suspending ? t.suspend : undefined}
        questionPrefix={suspending ? t.suspendQuestion : undefined}
        itemName={pending?.member.name ?? ''}
        description={suspending ? t.suspendDesc : undefined}
        confirmLabel={suspending ? t.suspend : undefined}
        tone={suspending ? 'warning' : 'danger'}
        onConfirm={async () => {
          if (!pending) return;
          try {
            await run({ id: pending.member.id, action: pending.action }).unwrap();
            toast.success(suspending ? t.suspendedDone : t.deleted, pending.member.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
