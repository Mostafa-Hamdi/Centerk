'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Check, Pencil, Plus, ReceiptText, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ExpenseCategoriesCard } from '@/features/extras/components/Tools';
import { ar } from '@/i18n/ar';
import { formatDate, formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  EXPENSE_STATUSES,
  useDeleteExpenseMutation,
  useGetExpensesQuery,
  useReviewExpenseMutation,
  type ExpenseDto,
  type ExpenseStatus,
} from '../api';
import { CashTabs } from './CashTabs';

const t = ar.expenses;
const tones = { Pending: 'warning', Approved: 'success', Rejected: 'danger' } as const;
const ALL = 'all';

/** /expenses — expenses list filtered by status (URL), approve/reject and delete pending ones. */
export function ExpensesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const status = EXPENSE_STATUSES.find((value) => value === statusParam);
  const page = Number(searchParams.get('page')) || 1;
  const { data, isLoading, isFetching, error, refetch } = useGetExpensesQuery({
    status,
    page,
    pageSize: 20,
    filters: {},
  });
  const [review] = useReviewExpenseMutation();
  const [remove] = useDeleteExpenseMutation();
  const [rejecting, setRejecting] = useState<ExpenseDto | null>(null);
  const [deleting, setDeleting] = useState<ExpenseDto | null>(null);

  const columns = useMemo<ColumnDef<ExpenseDto>[]>(() => {
    const approve = async (expense: ExpenseDto) => {
      try {
        await review({ id: expense.id, decision: 'approve' }).unwrap();
        toast.success(t.approved, formatMoney(expense.amount));
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      { accessorKey: 'category', header: t.columns.category },
      {
        accessorKey: 'description',
        header: t.columns.description,
        cell: ({ getValue }) => getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'amount',
        header: t.columns.amount,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'createdAt',
        header: t.columns.date,
        cell: ({ getValue }) => (getValue<string | null>() ? formatDate(getValue<string>()) : '—'),
      },
      {
        accessorKey: 'status',
        header: t.columns.status,
        cell: ({ getValue }) => (
          <Badge tone={tones[getValue<ExpenseStatus>()]} dot>
            {t.status[getValue<ExpenseStatus>()]}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) =>
          row.original.status === 'Pending' ? (
            <div className="flex gap-1">
              <Can permission="expenses.approve">
                <Button
                  size="sm"
                  variant="success"
                  iconStart={<Check aria-hidden />}
                  onClick={() => void approve(row.original)}
                >
                  {t.approve}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<X aria-hidden />}
                  onClick={() => setRejecting(row.original)}
                >
                  {t.reject}
                </Button>
              </Can>
              <Can permission="cash.update">
                <Link
                  href={routes.expenses.edit(row.original.id)}
                  aria-label={`${ar.common.edit} ${row.original.category}`}
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
              </Can>
              <Can permission="cash.delete">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`${ar.common.delete} ${row.original.category}`}
                  iconStart={<Trash2 aria-hidden />}
                  onClick={() => setDeleting(row.original)}
                />
              </Can>
            </div>
          ) : null,
      },
    ];
  }, [review]);

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
        <div className="flex flex-wrap items-center gap-2">
          <CashTabs />
          <Can permission="cash.create">
            <Link
              href={routes.expenses.new}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Plus className="size-4" aria-hidden />
              {t.add}
            </Link>
          </Can>
        </div>
      </header>
      <section className="list-panel">
        <div className="w-full max-w-xs">
          <Select
            aria-label={t.columns.status}
            value={status ?? ALL}
            onValueChange={(value) => setParam('status', value === ALL ? null : value)}
            options={[
              { value: ALL, label: t.all },
              ...EXPENSE_STATUSES.map((value) => ({ value, label: t.status[value] })),
            ]}
          />
        </div>
        <DataTable
          startIndex={((data?.page ?? 1) - 1) * 20}
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={ReceiptText} title={t.empty} />}
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

      <ExpenseCategoriesCard />

      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
        title={t.reject}
        questionPrefix={t.rejectQuestion}
        itemName={rejecting ? `${rejecting.category} · ${formatMoney(rejecting.amount)}` : ''}
        description=""
        confirmLabel={t.reject}
        onConfirm={async () => {
          if (!rejecting) return;
          try {
            await review({ id: rejecting.id, decision: 'reject' }).unwrap();
            toast.success(t.rejected, formatMoney(rejecting.amount));
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting ? `${deleting.category} · ${formatMoney(deleting.amount)}` : ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(ar.common.delete, deleting.category);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
