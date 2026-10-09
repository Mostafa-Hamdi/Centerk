'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Receipt, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatMoney, formatTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetPaymentsQuery, type PaymentDto } from '../api';

const t = ar.payments;

/** /payments — payments of a day (live GET /payments?date), date in the URL. */
export function PaymentsListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd');
  const page = Number(searchParams.get('page')) || 1;
  const { data, isLoading, isFetching, error, refetch } = useGetPaymentsQuery({
    date,
    page,
    pageSize: 20,
    filters: {},
  });

  const columns = useMemo<ColumnDef<PaymentDto>[]>(
    () => [
      {
        accessorKey: 'receiptNumber',
        header: t.columns.receipt,
        cell: ({ row }) => (
          <Link
            href={routes.payments.detail(row.original.id)}
            dir="ltr"
            className="font-medium tabular hover:text-primary"
          >
            {row.original.receiptNumber}
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
        accessorKey: 'method',
        header: t.columns.method,
        cell: ({ getValue }) => t.methods[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'collectedAt',
        header: t.columns.time,
        cell: ({ getValue }) => (getValue<string | null>() ? formatTime(getValue<string>()) : '—'),
      },
      {
        accessorKey: 'status',
        header: t.columns.status,
        cell: ({ getValue }) => (
          <Badge tone={getValue<string>() === 'Voided' ? 'danger' : 'success'} dot>
            {t.status[getValue<'Active' | 'Voided'>()]}
          </Badge>
        ),
      },
    ],
    [],
  );

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={routes.dues} className={buttonVariants({ variant: 'info', size: 'lg' })}>
            {t.dues}
          </Link>
          <Can permission="payments.create">
            <Link
              href={routes.payments.new}
              className={buttonVariants({ variant: 'success', size: 'lg' })}
            >
              <Wallet className="size-4" aria-hidden />
              {t.collect}
            </Link>
          </Can>
        </div>
      </header>
      <section className="list-panel">
        <div className="w-full max-w-xs">
          <DatePicker
            aria-label={t.date}
            value={date}
            onChange={(value) => setParam('date', value || null)}
          />
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
          onRowClick={(row) => router.push(routes.payments.detail(row.id))}
          empty={<EmptyState icon={Receipt} title={t.empty} />}
        />
        {data && data.totalCount > 0 ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={20}
            onPageChange={(next) => setParam('page', next > 1 ? String(next) : null)}
            onPageSizeChange={() => undefined}
          />
        ) : null}
      </section>
    </div>
  );
}
