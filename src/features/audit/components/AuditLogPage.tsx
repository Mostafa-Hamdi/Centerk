'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { DatePicker } from '@/components/ui/DatePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { useGetStaffQuery } from '@/features/staff/api';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { formatDateTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetAuditLogsQuery, type AuditEntryDto } from '../api';

const t = ar.audit;

/** /audit-log — sensitive-change history with action / entity / date-range filters in the URL. */
export function AuditLogPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const { action, entityType, from, to } = list.params.filters;
  const { data, isLoading, isFetching, error, refetch } = useGetAuditLogsQuery({
    ...list.params,
    filters: {},
    sort: list.params.sort ?? '-occurredAtUtc',
    action,
    entityType,
    from,
    to,
  });
  const staff = useGetStaffQuery({ page: 1, pageSize: 100, filters: {} });

  const columns = useMemo<ColumnDef<AuditEntryDto>[]>(() => {
    const actorName = (entry: AuditEntryDto) =>
      entry.actorName ??
      (entry.actorId && staff.data?.items.find((member) => member.id === entry.actorId)?.name) ??
      '—';
    return [
      {
        accessorKey: 'occurredAt',
        header: t.columns.time,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      { id: 'actor', header: t.columns.actor, cell: ({ row }) => actorName(row.original) },
      {
        accessorKey: 'action',
        header: t.columns.action,
        cell: ({ getValue }) => (
          <Badge dir="ltr" tone="primary">
            {getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: 'entityType',
        header: t.columns.entity,
        cell: ({ getValue }) => (
          <span dir="ltr" className="text-sm">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'reason',
        header: t.columns.reason,
        cell: ({ getValue }) => (
          <span className="line-clamp-1 max-w-xs text-sm text-muted">
            {getValue<string | null>() ?? '—'}
          </span>
        ),
      },
    ];
  }, [staff.data]);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>
      <section className="list-panel">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SearchInput
            value={action ?? ''}
            onSearch={(value) => list.setFilter('action', value || null)}
            placeholder={t.actionPlaceholder}
          />
          <SearchInput
            value={entityType ?? ''}
            onSearch={(value) => list.setFilter('entityType', value || null)}
            placeholder={t.entityPlaceholder}
          />
          <DatePicker
            aria-label={t.from}
            value={from ?? ''}
            onChange={(value) => list.setFilter('from', value || null)}
          />
          <DatePicker
            aria-label={t.to}
            value={to ?? ''}
            onChange={(value) => list.setFilter('to', value || null)}
          />
        </div>
        <DataTable
          startIndex={((data?.page ?? 1) - 1) * list.params.pageSize}
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          onRowClick={(row) => router.push(routes.audit.detail(row.id))}
          empty={<EmptyState icon={History} title={t.empty} />}
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
    </div>
  );
}
