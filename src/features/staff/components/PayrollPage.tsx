'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Banknote, HandCoins, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { useGetCurrentShiftQuery } from '@/features/cash/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  isPaid,
  useCreatePayrollMutation,
  useDeletePayrollMutation,
  useGetPayrollsQuery,
  useGetStaffQuery,
  usePayPayrollMutation,
  type PayrollDto,
} from '../api';
import { StaffHeader } from './StaffHeader';

const t = ar.staff.payroll;
const v = ar.validation;

const amount = (required: boolean) =>
  z
    .string()
    .trim()
    .transform((value) => (value === '' ? (required ? Number.NaN : 0) : Number(value)))
    .pipe(
      z.number({ error: v.number }).min(0, v.minValue(0)).max(1_000_000, v.maxValue(1_000_000)),
    );

const payrollSchema = z.object({
  userId: z.string().min(1, v.required),
  baseSalary: amount(true),
  bonus: amount(false),
  deductions: amount(false),
});

type PayrollInput = z.input<typeof payrollSchema>;
type PayrollValues = z.output<typeof payrollSchema>;
type Pending = { payroll: PayrollDto; action: 'pay' | 'delete' };

/** /staff/payroll — a month's payrolls (month in the URL), add, pay from the drawer, delete. */
export function PayrollPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const month = searchParams.get('month') ?? format(new Date(), 'yyyy-MM');
  const branchId = useAppSelector(selectCurrentBranchId);
  const { data, isLoading, isFetching, error, refetch } = useGetPayrollsQuery({
    month,
    page: 1,
    pageSize: 100,
    filters: {},
  });
  const staff = useGetStaffQuery({ page: 1, pageSize: 100, filters: {} });
  const shift = useGetCurrentShiftQuery(undefined);
  const [create] = useCreatePayrollMutation();
  const [pay] = usePayPayrollMutation();
  const [remove] = useDeletePayrollMutation();
  const [pending, setPending] = useState<Pending | null>(null);
  const form = useForm<PayrollInput, unknown, PayrollValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: { userId: '', baseSalary: '', bonus: '', deductions: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const staffName = (id: string | null) =>
    (id && staff.data?.items.find((member) => member.id === id)?.name) ?? '—';
  const totalNet = (data?.items ?? []).reduce((sum, payroll) => sum + payroll.net, 0);

  const columns = useMemo<ColumnDef<PayrollDto>[]>(
    () => [
      {
        accessorKey: 'userId',
        header: t.staff,
        cell: ({ getValue }) =>
          (getValue<string | null>() &&
            staff.data?.items.find((member) => member.id === getValue<string>())?.name) ??
          '—',
      },
      ...(['baseSalary', 'bonus', 'deductions', 'net'] as const).map(
        (key): ColumnDef<PayrollDto> => ({
          accessorKey: key,
          header: { baseSalary: t.base, bonus: t.bonus, deductions: t.deductions, net: t.net }[key],
          meta: { className: key === 'net' ? 'tabular font-bold' : 'tabular' },
          cell: ({ getValue }) => formatMoney(getValue<number>()),
        }),
      ),
      {
        id: 'status',
        header: t.status,
        cell: ({ row }) =>
          isPaid(row.original) ? (
            <Badge tone="success" dot>
              {t.paidStatus}
            </Badge>
          ) : (
            <Badge tone="warning" dot>
              {t.pendingStatus}
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          isPaid(row.original) ? null : (
            <div className="flex gap-1">
              <Can permission="payroll.pay">
                <Button
                  size="sm"
                  variant="success"
                  iconStart={<HandCoins aria-hidden />}
                  onClick={() => setPending({ payroll: row.original, action: 'pay' })}
                >
                  {t.pay}
                </Button>
              </Can>
              <Can permission="staff.update">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={ar.common.delete}
                  iconStart={<Trash2 aria-hidden />}
                  onClick={() => setPending({ payroll: row.original, action: 'delete' })}
                />
              </Can>
            </div>
          ),
      },
    ],
    [staff.data],
  );

  const save = async (values: PayrollValues) => {
    try {
      await create({ ...values, month }).unwrap();
      toast.success(t.added, staffName(values.userId));
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['userId', 'baseSalary', 'bonus', 'deductions']);
      toast.error(problem.title, problem.detail);
    }
  };

  const paying = pending?.action === 'pay';

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <StaffHeader />
      <section className="list-panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.month}
            <Input
              type="month"
              dir="ltr"
              className="w-48"
              value={month}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams.toString());
                if (event.target.value) next.set('month', event.target.value);
                else next.delete('month');
                router.replace(`${pathname}?${next.toString()}`, { scroll: false });
              }}
            />
          </label>
          <p className="text-sm text-muted">
            {t.total}:{' '}
            <span className="font-display text-lg font-bold text-ink tabular">
              {formatMoney(totalNet)}
            </span>
          </p>
        </div>

        <Can permission="staff.update">
          <Card className="bg-canvas p-4 shadow-none">
            <form
              noValidate
              className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
              onSubmit={(event) => {
                form
                  .handleSubmit(
                    save,
                    toastInvalidForm,
                  )(event)
                  .catch(() => undefined);
              }}
            >
              <FormField label={t.staff} error={errors.userId?.message} required>
                {(control) => (
                  <Controller
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <Select
                        {...control}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        options={(staff.data?.items ?? []).map((member) => ({
                          value: member.id,
                          label: member.name,
                        }))}
                      />
                    )}
                  />
                )}
              </FormField>
              {(['baseSalary', 'bonus', 'deductions'] as const).map((key) => (
                <FormField
                  key={key}
                  label={{ baseSalary: t.base, bonus: t.bonus, deductions: t.deductions }[key]}
                  error={errors[key]?.message}
                  required={key === 'baseSalary'}
                >
                  {(control) => (
                    <Input
                      {...control}
                      {...form.register(key)}
                      inputMode="decimal"
                      dir="ltr"
                      className="tabular"
                    />
                  )}
                </FormField>
              ))}
              <Button type="submit" loading={isSubmitting}>
                {t.add}
              </Button>
            </form>
          </Card>
        </Can>

        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={Banknote} title={t.empty} />}
        />
      </section>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={paying ? t.pay : undefined}
        questionPrefix={paying ? t.payQuestion : undefined}
        itemName={
          pending
            ? `${staffName(pending.payroll.userId)} · ${formatMoney(pending.payroll.net)}`
            : ''
        }
        description={paying ? t.payDesc : undefined}
        confirmLabel={paying ? t.pay : undefined}
        tone={paying ? 'warning' : 'danger'}
        onConfirm={async () => {
          if (!pending) return;
          try {
            if (paying) {
              await pay({
                id: pending.payroll.id,
                branchId: branchId ?? undefined,
                cashShiftId: shift.data?.id,
              }).unwrap();
              toast.success(t.paid, formatMoney(pending.payroll.net));
            } else {
              await remove(pending.payroll.id).unwrap();
              toast.success(t.deleted);
            }
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
