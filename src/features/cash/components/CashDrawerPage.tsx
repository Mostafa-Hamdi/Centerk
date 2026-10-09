'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Banknote, Clock, History, LockKeyhole, Wallet } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { Textarea } from '@/components/ui/Textarea';
import { Can } from '@/features/auth/components/Can';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDateTime, formatMoney, formatTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useCloseShiftMutation,
  useGetCurrentShiftQuery,
  useGetShiftsQuery,
  useOpenShiftMutation,
  type CashShiftDto,
} from '../api';
import { CashTabs } from './CashTabs';

const t = ar.cash;
const v = ar.validation;

const money = z
  .string()
  .trim()
  .min(1, v.required)
  .transform(Number)
  .pipe(z.number({ error: v.number }).min(0, v.minValue(0)).max(1_000_000, v.maxValue(1_000_000)));

const openSchema = z.object({ openingBalance: money });
const closeSchema = z.object({
  countedCash: money,
  varianceReason: z.string().trim().max(500, v.tooLong(500)),
});

type CloseValues = z.output<typeof closeSchema>;

/** /cash-drawer — current shift (open / count & close) and the shifts history (live /cash-shifts). */
export function CashDrawerPage() {
  const current = useGetCurrentShiftQuery(undefined);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <CashTabs />
      </header>

      {current.error ? (
        <ErrorState
          title={ar.list.loadError}
          description={toProblem(current.error).title}
          onRetry={() => void current.refetch()}
        />
      ) : current.isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : current.data ? (
        <OpenShiftPanel shift={current.data} />
      ) : (
        <OpenShiftForm />
      )}

      <ShiftsHistory />
    </div>
  );
}

function OpenShiftForm() {
  const branchId = useAppSelector(selectCurrentBranchId);
  const [openShift] = useOpenShiftMutation();
  const form = useForm<z.input<typeof openSchema>, unknown, z.output<typeof openSchema>>({
    resolver: zodResolver(openSchema),
    defaultValues: { openingBalance: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const save = async ({ openingBalance }: z.output<typeof openSchema>) => {
    try {
      await openShift({ branchId: branchId ?? undefined, openingBalance }).unwrap();
      toast.success(t.opened, formatMoney(openingBalance));
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['openingBalance']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-6">
      <EmptyState icon={Wallet} title={t.noShift} description={t.noShiftDesc} />
      <Can permission="cash.create">
        <form
          noValidate
          className="mx-auto flex w-full max-w-md flex-wrap items-end gap-3"
          onSubmit={(event) => {
            form
              .handleSubmit(
                save,
                toastInvalidForm,
              )(event)
              .catch(() => undefined);
          }}
        >
          <FormField
            label={t.openingBalance}
            error={errors.openingBalance?.message}
            required
            className="min-w-48 flex-1"
          >
            {(control) => (
              <Input
                {...control}
                {...form.register('openingBalance')}
                inputMode="decimal"
                dir="ltr"
                className="tabular"
              />
            )}
          </FormField>
          <Button type="submit" variant="success" loading={isSubmitting}>
            {t.open}
          </Button>
        </form>
      </Can>
    </Card>
  );
}

function OpenShiftPanel({ shift }: { shift: CashShiftDto }) {
  const [closeShift] = useCloseShiftMutation();
  const [pending, setPending] = useState<CloseValues | null>(null);
  const form = useForm<z.input<typeof closeSchema>, unknown, CloseValues>({
    resolver: zodResolver(closeSchema),
    defaultValues: { countedCash: '', varianceReason: '' },
  });
  const { errors } = form.formState;
  const expected = shift.expectedCash ?? shift.openingBalance;
  const countedRaw = form.watch('countedCash');
  const counted = countedRaw.trim() === '' ? null : Number(countedRaw);
  const variance = counted === null || Number.isNaN(counted) ? null : counted - expected;

  const review = (values: CloseValues) => {
    if (values.countedCash !== expected && !values.varianceReason) {
      form.setError('varianceReason', { message: v.required });
      return;
    }
    setPending(values);
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <div className="grid gap-(--shell-gap) sm:grid-cols-3">
        <StatCard
          label={t.openedAt}
          value={shift.openedAt ? formatTime(shift.openedAt) : '—'}
          icon={Clock}
          tone="cyan"
        />
        <StatCard
          label={t.columns.opening}
          value={formatMoney(shift.openingBalance)}
          icon={Banknote}
        />
        <StatCard label={t.expected} value={formatMoney(expected)} icon={Wallet} tone="success" />
      </div>

      <Can permission="cash.closeShift">
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
            <LockKeyhole className="size-5 text-muted" aria-hidden />
            {t.closeTitle}
          </h2>
          <form
            noValidate
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  review,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            <FormField label={t.counted} error={errors.countedCash?.message} required>
              {(control) => (
                <Input
                  {...control}
                  {...form.register('countedCash')}
                  inputMode="decimal"
                  dir="ltr"
                  className="tabular"
                />
              )}
            </FormField>
            <div className="flex flex-col justify-end gap-1 pb-2 text-sm">
              <span className="text-muted">{t.variance}</span>
              <span
                className={
                  variance === null
                    ? 'text-muted'
                    : variance === 0
                      ? 'font-bold text-success tabular'
                      : 'font-bold text-danger tabular'
                }
              >
                {variance === null ? '—' : formatMoney(variance)}
              </span>
            </div>
            <FormField
              label={t.varianceReason}
              hint={t.varianceReasonHint}
              error={errors.varianceReason?.message}
              className="md:col-span-2"
            >
              {(control) => <Textarea {...control} {...form.register('varianceReason')} rows={2} />}
            </FormField>
            <div className="md:col-span-2">
              <Button type="submit" variant="warning">
                {t.close}
              </Button>
            </div>
          </form>
        </Card>
      </Can>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={t.closeTitle}
        questionPrefix={t.close}
        itemName={pending ? formatMoney(pending.countedCash) : ''}
        description={
          pending ? `${t.variance}: ${formatMoney(pending.countedCash - expected)}` : undefined
        }
        confirmLabel={t.close}
        tone="warning"
        onConfirm={async () => {
          if (!pending) return;
          try {
            const closed = await closeShift({
              id: shift.id,
              countedCash: pending.countedCash,
              varianceReason: pending.varianceReason || undefined,
            }).unwrap();
            toast.success(t.closed, `${t.variance}: ${formatMoney(closed.variance ?? 0)}`);
            form.reset();
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}

function ShiftsHistory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { data, isLoading, isFetching, error, refetch } = useGetShiftsQuery({
    page,
    pageSize: 10,
    filters: {},
  });

  const columns = useMemo<ColumnDef<CashShiftDto>[]>(
    () => [
      {
        accessorKey: 'openedAt',
        header: t.columns.openedAt,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        accessorKey: 'closedAt',
        header: t.columns.closedAt,
        cell: ({ getValue }) =>
          getValue<string | null>() ? (
            formatDateTime(getValue<string>())
          ) : (
            <Badge tone="success" dot>
              {t.stillOpen}
            </Badge>
          ),
      },
      {
        accessorKey: 'openingBalance',
        header: t.columns.opening,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'expectedCash',
        header: t.columns.expected,
        meta: { className: 'tabular' },
        cell: ({ getValue }) =>
          getValue<number | null>() === null ? '—' : formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'countedCash',
        header: t.columns.counted,
        meta: { className: 'tabular' },
        cell: ({ getValue }) =>
          getValue<number | null>() === null ? '—' : formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'variance',
        header: t.columns.variance,
        meta: { className: 'tabular' },
        cell: ({ row }) => {
          const variance = row.original.variance;
          if (variance === null) return '—';
          return (
            <span
              className={variance === 0 ? 'text-success' : 'text-danger'}
              title={row.original.varianceReason ?? undefined}
            >
              {formatMoney(variance)}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <section className="list-panel">
      <h2 className="font-display text-lg font-bold text-ink">{t.history}</h2>
      <DataTable
        caption={t.history}
        data={data?.items}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error ? toProblem(error).title : null}
        onRetry={() => void refetch()}
        empty={<EmptyState icon={History} title={t.historyEmpty} />}
      />
      {data && data.totalCount > 0 ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={10}
          onPageChange={(next) => {
            const params = new URLSearchParams(searchParams.toString());
            if (next > 1) params.set('page', String(next));
            else params.delete('page');
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }}
          onPageSizeChange={() => undefined}
        />
      ) : null}
    </section>
  );
}
