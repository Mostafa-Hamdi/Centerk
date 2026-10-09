'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Copy, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import {
  useGetRolesQuery,
  useGetSystemRolesQuery,
  useRoleActionMutation,
  type RoleDto,
} from '../api';

const t = ar.roles;

/** /roles — system roles (read-only) + custom roles: edit, duplicate, delete. */
export function RolesPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetRolesQuery(list.params);
  const systemRoles = useGetSystemRolesQuery(undefined);
  const [run] = useRoleActionMutation();
  const [deleting, setDeleting] = useState<RoleDto | null>(null);

  const columns = useMemo<ColumnDef<RoleDto>[]>(() => {
    const duplicate = async (role: RoleDto) => {
      try {
        await run({ id: role.id, action: 'duplicate' }).unwrap();
        toast.success(t.duplicated, role.name);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      {
        accessorKey: 'name',
        header: t.columns.name,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2 font-medium">
              {row.original.name}
              {row.original.isActive ? null : <Badge>{t.inactive}</Badge>}
            </span>
            {row.original.description ? (
              <span className="line-clamp-1 text-xs text-muted">{row.original.description}</span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'baseRole',
        header: t.columns.base,
        cell: ({ getValue }) => ar.staff.roles[getValue<string>()] ?? getValue<string>(),
      },
      {
        id: 'permissions',
        header: t.columns.permissions,
        cell: ({ row }) => (
          <Badge tone="primary">{t.permissionsCount(row.original.codes.length)}</Badge>
        ),
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Link
              href={routes.roles.edit(row.original.id)}
              aria-label={`${ar.common.edit} ${row.original.name}`}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              <Pencil className="size-4" aria-hidden />
            </Link>
            <Button
              size="sm"
              variant="ghost"
              aria-label={`${ar.materials.duplicate} ${row.original.name}`}
              iconStart={<Copy aria-hidden />}
              onClick={() => void duplicate(row.original)}
            />
            {row.original.isSystem ? null : (
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.delete} ${row.original.name}`}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => setDeleting(row.original)}
              />
            )}
          </div>
        ),
      },
    ];
  }, [run]);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <Link
          href={routes.roles.new}
          className={buttonVariants({ variant: 'primary', size: 'lg' })}
        >
          <Plus className="size-4" aria-hidden />
          {t.add}
        </Link>
      </header>

      {systemRoles.data?.length ? (
        <section aria-labelledby="system-roles" className="flex flex-col gap-3">
          <h2 id="system-roles" className="font-display text-lg font-bold text-ink">
            {t.systemTitle}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {systemRoles.data.map((role) => (
              <li key={role.name}>
                <Card className="flex items-center gap-3 p-4">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary-tint text-primary">
                    <ShieldCheck className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-ink">{ar.staff.roles[role.name] ?? role.name}</p>
                    <p className="text-xs text-muted">
                      {role.isOwner
                        ? t.owner
                        : role.dataScope
                          ? (t.scopes[role.dataScope] ?? role.dataScope)
                          : t.system}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="list-panel">
        <h2 className="font-display text-lg font-bold text-ink">{t.caption}</h2>
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          onRowClick={(row) => router.push(routes.roles.edit(row.id))}
          empty={<EmptyState icon={ShieldCheck} title={t.empty} description={t.emptyDesc} />}
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
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        description={t.deleteDesc}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await run({ id: deleting.id, action: 'delete' }).unwrap();
            toast.success(t.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
