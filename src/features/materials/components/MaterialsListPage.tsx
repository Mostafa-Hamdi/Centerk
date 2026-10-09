'use client';

import { ExportButton } from '@/components/data/ExportButton';
import type { ColumnDef } from '@tanstack/react-table';
import { BookCopy, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Switch } from '@/components/ui/Switch';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetGradeLevelsQuery } from '@/features/lookups/api';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { BulkDeleteBar, useBulkSelection } from '@/features/extras/components/BulkDelete';
import { ar } from '@/i18n/ar';
import { formatMoney, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  isLowStock,
  useDeleteMaterialMutation,
  useDuplicateMaterialMutation,
  useGetMaterialsQuery,
  type MaterialDto,
} from '../api';

const t = ar.materials;

/** /materials — URL-synced search, low-stock filter, duplicate and delete. */
export function MaterialsListPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const bulk = useBulkSelection();
  const lowStock = list.params.filters.lowStock === 'true';
  const { data, isLoading, isFetching, error, refetch } = useGetMaterialsQuery({
    ...list.params,
    filters: {},
    lowStock,
  });
  const grades = useGetGradeLevelsQuery(undefined);
  const [duplicate] = useDuplicateMaterialMutation();
  const [remove] = useDeleteMaterialMutation();
  const [deleting, setDeleting] = useState<MaterialDto | null>(null);

  const columns = useMemo<ColumnDef<MaterialDto>[]>(() => {
    const gradeName = (id: string | null) =>
      (id && grades.data?.find((grade) => grade.id === id)?.name) ?? '—';
    const copy = async (material: MaterialDto) => {
      try {
        await duplicate(material.id).unwrap();
        toast.success(t.duplicated, material.name);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      {
        accessorKey: 'name',
        header: t.columns.name,
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={routes.materials.detail(row.original.id)}
              className="font-medium hover:text-primary"
            >
              {row.original.name}
            </Link>
            {row.original.includedInSubscription ? <Badge tone="info">{t.included}</Badge> : null}
          </div>
        ),
      },
      {
        accessorKey: 'gradeLevelId',
        header: t.columns.grade,
        cell: ({ getValue }) => gradeName(getValue<string | null>()),
      },
      {
        accessorKey: 'price',
        header: t.columns.price,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'stockQty',
        header: t.columns.stock,
        meta: { className: 'tabular' },
        cell: ({ row }) =>
          isLowStock(row.original) ? (
            <Badge tone="warning" dot>
              {formatNumber(row.original.stockQty)} · {t.lowStock}
            </Badge>
          ) : (
            formatNumber(row.original.stockQty)
          ),
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Can permission="materials.update">
              <Link
                href={routes.materials.edit(row.original.id)}
                aria-label={`${ar.common.edit} ${row.original.name}`}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                <Pencil className="size-4" aria-hidden />
              </Link>
            </Can>
            <Can permission="materials.create">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${t.duplicate} ${row.original.name}`}
                iconStart={<Copy aria-hidden />}
                onClick={() => void copy(row.original)}
              />
            </Can>
            <Can permission="materials.delete">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.delete} ${row.original.name}`}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => setDeleting(row.original)}
              />
            </Can>
          </div>
        ),
      },
    ];
  }, [grades.data, duplicate]);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <Can permission="materials.create">
          <Link
            href={routes.materials.new}
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            <Plus className="size-4" aria-hidden />
            {t.add}
          </Link>
        </Can>
      </header>
      <section className="list-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchInput
            value={list.params.search ?? ''}
            onSearch={list.setSearch}
            placeholder={t.searchPlaceholder}
            className="w-full max-w-sm"
          />
          <Switch
            checked={lowStock}
            onCheckedChange={(checked) => list.setFilter('lowStock', checked ? 'true' : null)}
            label={t.lowStockOnly}
          />
          <Can permission="materials.export">
            <ExportButton path="/materials/export" params={{}} fileName="materials" />
          </Can>
        </div>
        <DataTable
          rowSelection={bulk.selection}
          onRowSelectionChange={bulk.setSelection}
          startIndex={((data?.page ?? 1) - 1) * list.params.pageSize}
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          onRowClick={(row) => router.push(routes.materials.detail(row.id))}
          empty={<EmptyState icon={BookCopy} title={t.empty} description={t.emptyDesc} />}
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

      <Can permission="materials.delete">
        <BulkDeleteBar
          resource="materials"
          tag="Material"
          ids={bulk.ids}
          onDone={() => bulk.setSelection({})}
        />
      </Can>

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
            await remove(deleting.id).unwrap();
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
