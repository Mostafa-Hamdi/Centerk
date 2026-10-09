'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { BellRing, CircleCheck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetDuesQuery, useRemindDueMutation, type DueDto } from '../api';

const t = ar.payments;

/** /payments/dues — students with open balances (live GET /dues), remind (24h cooldown server-side) or collect. */
export function DuesPage() {
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetDuesQuery(list.params);
  const [remind] = useRemindDueMutation();

  const columns = useMemo<ColumnDef<DueDto>[]>(
    () => [
      {
        id: 'student',
        header: ar.students.columns.student,
        cell: ({ row }) => (
          <Link
            href={routes.students.detail(row.original.studentId)}
            className="flex flex-col hover:text-primary"
          >
            <span className="font-medium">{row.original.studentName}</span>
            <span dir="ltr" className="text-xs text-muted tabular">
              {row.original.code}
            </span>
          </Link>
        ),
      },
      {
        accessorKey: 'amount',
        header: t.columns.amount,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'overdueDays',
        header: ar.payments.duesPage.title,
        cell: ({ getValue }) => (
          <Badge tone={getValue<number>() > 30 ? 'danger' : 'warning'}>
            {t.duesPage.overdue(getValue<number>())}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{ar.list.actions}</span>,
        meta: { label: ar.list.actions },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Can permission="messages.create">
              <Button
                size="sm"
                variant="info"
                iconStart={<BellRing aria-hidden />}
                onClick={() => {
                  remind(row.original.studentId)
                    .unwrap()
                    .then(() => toast.success(t.duesPage.reminded, row.original.studentName))
                    .catch((caught: unknown) => toast.error(toProblem(caught).title));
                }}
              >
                {t.duesPage.remind}
              </Button>
            </Can>
            <Can permission="payments.create">
              <Link
                href={`${routes.payments.new}?studentId=${row.original.studentId}`}
                className="flex min-h-11 items-center gap-1.5 rounded-md bg-success px-3 text-sm font-medium text-primary-ink hover:bg-success-hover"
              >
                <Wallet className="size-4" aria-hidden />
                {t.collect}
              </Link>
            </Can>
          </div>
        ),
      },
    ],
    [remind],
  );

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.duesPage.title}</h1>
      </header>
      <section className="list-panel">
        <DataTable
          caption={t.duesPage.title}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.studentId}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={CircleCheck} title={t.duesPage.empty} />}
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
