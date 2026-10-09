'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarPlus, HandHeart, Pencil, ReceiptText, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery } from '@/features/groups/api';
import { useGetStudentChargesQuery, type ChargeDto } from '@/features/payments/api';
import { useGetStudentsQuery } from '@/features/students/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDate, formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useChargeActionMutation,
  useCreateChargeMutation,
  useEditChargeMutation,
  useGenerateChargesMutation,
} from '../chargesApi';

const t = ar.charges;
const v = ar.validation;

type Pending = { charge: ChargeDto; action: 'waive' | 'delete' };

/** /payments/charges — generate a month's charges; per student: add, correct, waive, cancel. */
export function ChargesPage() {
  const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const [generate, generating] = useGenerateChargesMutation();
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState<string | undefined>();
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const charges = useGetStudentChargesQuery(studentId ?? '', { skip: !studentId });
  const [run] = useChargeActionMutation();
  const [edit] = useEditChargeMutation();
  const [pending, setPending] = useState<Pending | null>(null);
  const [editing, setEditing] = useState<ChargeDto | null>(null);
  const [newAmount, setNewAmount] = useState('');

  const columns = useMemo<ColumnDef<ChargeDto>[]>(
    () => [
      {
        accessorKey: 'period',
        header: t.columns.period,
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
        header: t.columns.created,
        cell: ({ getValue }) => (getValue<string | null>() ? formatDate(getValue<string>()) : '—'),
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => (
          <Can permission="payments.update">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.edit} ${row.original.period ?? ''}`}
                iconStart={<Pencil aria-hidden />}
                onClick={() => {
                  setEditing(row.original);
                  setNewAmount(String(row.original.amount));
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                iconStart={<HandHeart aria-hidden />}
                onClick={() => setPending({ charge: row.original, action: 'waive' })}
              >
                {t.waive}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={t.cancel}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => setPending({ charge: row.original, action: 'delete' })}
              />
            </div>
          </Can>
        ),
      },
    ],
    [],
  );

  const runGenerate = async () => {
    try {
      const result = await generate(period).unwrap();
      toast.success(t.generated(result.created));
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  const amountValue = Number(newAmount);
  const amountInvalid = newAmount.trim() === '' || Number.isNaN(amountValue) || amountValue < 0;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>

      <Can permission="payments.create">
        <Card className="flex flex-wrap items-end justify-between gap-4 p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{t.generateTitle}</h2>
            <p className="mt-1 text-sm text-muted">{t.generateHint}</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              {t.period}
              <Input
                type="month"
                dir="ltr"
                className="w-44"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              />
            </label>
            <Button
              iconStart={<CalendarPlus aria-hidden />}
              disabled={!period}
              loading={generating.isLoading}
              onClick={() => void runGenerate()}
            >
              {t.generate}
            </Button>
          </div>
        </Card>
      </Can>

      <section className="list-panel">
        <div className="w-full max-w-md">
          <Combobox
            aria-label={t.student}
            value={studentId}
            onValueChange={setStudentId}
            onSearch={setSearch}
            loading={students.isFetching}
            placeholder={t.pickStudent}
            options={(students.data?.items ?? []).map((student) => ({
              value: student.id,
              label: `${student.fullName} · ${student.code}`,
            }))}
          />
        </div>
        {studentId ? (
          <>
            <Can permission="payments.create">
              <AddChargeForm studentId={studentId} />
            </Can>
            <DataTable
              caption={t.title}
              data={charges.data}
              columns={columns}
              getRowId={(row) => row.id}
              isLoading={charges.isLoading}
              isFetching={charges.isFetching}
              error={charges.error ? toProblem(charges.error).title : null}
              onRetry={() => void charges.refetch()}
              empty={<EmptyState icon={ReceiptText} title={t.empty} />}
            />
          </>
        ) : (
          <EmptyState icon={ReceiptText} title={t.pickStudent} />
        )}
      </section>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={pending?.action === 'waive' ? t.waive : t.cancel}
        questionPrefix={pending?.action === 'waive' ? t.waiveQuestion : ar.confirm.voidPrefix}
        itemName={
          pending ? `${pending.charge.period ?? ''} · ${formatMoney(pending.charge.amount)}` : ''
        }
        description=""
        confirmLabel={pending?.action === 'waive' ? t.waive : t.cancel}
        tone={pending?.action === 'waive' ? 'warning' : 'danger'}
        requireReason
        onConfirm={async (reason) => {
          if (!pending || !studentId) return;
          try {
            await run({
              id: pending.charge.id,
              studentId,
              action: pending.action,
              reason: reason ?? '',
            }).unwrap();
            toast.success(pending.action === 'waive' ? t.waived : t.cancelled);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />

      <ConfirmDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={t.edit}
        questionPrefix={t.editQuestion}
        itemName={editing ? `${editing.period ?? ''} · ${formatMoney(editing.amount)}` : ''}
        description={
          <label className="mt-3 flex flex-col gap-1 text-start text-sm font-medium text-ink">
            {t.newAmount}
            <Input
              value={newAmount}
              onChange={(event) => setNewAmount(event.target.value)}
              inputMode="decimal"
              dir="ltr"
              aria-invalid={amountInvalid || undefined}
            />
          </label>
        }
        confirmLabel={t.edit}
        tone="warning"
        requireReason
        onConfirm={async (reason) => {
          if (!editing || !studentId || amountInvalid) return;
          try {
            await edit({
              id: editing.id,
              studentId,
              amount: amountValue,
              reason: reason ?? '',
            }).unwrap();
            toast.success(t.edited, formatMoney(amountValue));
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}

const chargeSchema = z.object({
  groupId: z.string().min(1, v.required),
  period: z.string().min(1, v.required),
  amount: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(z.number({ error: v.number }).positive(v.minValue(1)).max(100_000, v.maxValue(100_000))),
});

function AddChargeForm({ studentId }: { studentId: string }) {
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const [create] = useCreateChargeMutation();
  const form = useForm<z.input<typeof chargeSchema>, unknown, z.output<typeof chargeSchema>>({
    resolver: zodResolver(chargeSchema),
    defaultValues: { groupId: '', period: format(new Date(), 'yyyy-MM'), amount: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = async (values: z.output<typeof chargeSchema>) => {
    try {
      await create({ studentId, ...values }).unwrap();
      toast.success(t.added, formatMoney(values.amount));
      form.reset({ ...values, amount: '' });
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['groupId', 'period', 'amount']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <Card className="bg-canvas p-4 shadow-none">
      <form
        noValidate
        className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label={t.addTitle}
        onSubmit={(event) => {
          form
            .handleSubmit(
              submit,
              toastInvalidForm,
            )(event)
            .catch(() => undefined);
        }}
      >
        <FormField label={t.group} error={errors.groupId?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    const price = groups.data?.items.find((group) => group.id === value)?.price;
                    if (price && !form.getValues('amount')) form.setValue('amount', String(price));
                  }}
                  options={(groups.data?.items ?? []).map((group) => ({
                    value: group.id,
                    label: group.name,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.period} error={errors.period?.message} required>
          {(control) => <Input {...control} {...form.register('period')} type="month" dir="ltr" />}
        </FormField>
        <FormField label={t.amount} error={errors.amount?.message} required>
          {(control) => (
            <Input {...control} {...form.register('amount')} inputMode="decimal" dir="ltr" />
          )}
        </FormField>
        <Button type="submit" loading={isSubmitting}>
          {t.add}
        </Button>
      </form>
    </Card>
  );
}
