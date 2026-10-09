'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { Combobox } from '@/components/ui/Combobox';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { routes } from '@/config/routes';
import { useGetStudentsQuery } from '@/features/students/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  allocateFifo,
  PAYMENT_METHODS,
  useCollectPaymentMutation,
  useGetStudentChargesQuery,
} from '../api';

const t = ar.payments;
const v = ar.validation;

/** Swagger NewPaymentV1: amount > 0, method, transfers need a reference number. */
const collectSchema = z
  .object({
    studentId: z.string().min(1, v.required),
    amount: z
      .string()
      .trim()
      .min(1, v.required)
      .transform(Number)
      .pipe(
        z.number({ error: v.number }).positive(v.minValue(1)).max(100_000, v.maxValue(100_000)),
      ),
    method: z.enum(PAYMENT_METHODS),
    referenceNo: z.string().trim().max(100, v.tooLong(100)),
    notes: z.string().trim().max(500, v.tooLong(500)),
  })
  .superRefine((value, ctx) => {
    if (value.method !== 'Cash' && !value.referenceNo) {
      ctx.addIssue({ code: 'custom', path: ['referenceNo'], message: v.required });
    }
  });

type CollectInput = z.input<typeof collectSchema>;
type CollectValues = z.output<typeof collectSchema>;

/** /payments/new — collect a payment (FIFO over open charges), then open the receipt. */
export function CollectPaymentPage() {
  const router = useRouter();
  const presetStudent = useSearchParams().get('studentId') ?? '';
  const [search, setSearch] = useState('');
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const [collect] = useCollectPaymentMutation();
  const form = useForm<CollectInput, unknown, CollectValues>({
    resolver: zodResolver(collectSchema),
    mode: 'onBlur',
    defaultValues: {
      studentId: presetStudent,
      amount: '',
      method: 'Cash',
      referenceNo: '',
      notes: '',
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;
  const studentId = form.watch('studentId');
  const charges = useGetStudentChargesQuery(studentId, { skip: !studentId });
  const openTotal = (charges.data ?? []).reduce((sum, charge) => sum + charge.amount, 0);

  const save = async (values: CollectValues) => {
    try {
      const result = await collect({
        studentId: values.studentId,
        amount: values.amount,
        method: values.method,
        referenceNo: values.referenceNo || undefined,
        notes: values.notes || undefined,
        allocations: allocateFifo(values.amount, charges.data ?? []),
      }).unwrap();
      toast.success(
        t.form.done,
        result.receiptNumber ? t.receipt.title(result.receiptNumber) : formatMoney(values.amount),
      );
      router.replace(result.id ? routes.payments.detail(result.id) : routes.payments.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'studentId',
        'amount',
        'method',
        'referenceNo',
        'notes',
      ]);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={t.form.title}
      backHref={routes.payments.list}
      onSubmit={(event) => {
        form
          .handleSubmit(
            save,
            toastInvalidForm,
          )(event)
          .catch(() => undefined);
      }}
      actions={
        <FormActions
          cancelHref={routes.payments.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
          submitLabel={t.form.submit}
        />
      }
    >
      <FormSection title={t.form.title}>
        <FormField
          label={t.form.student}
          error={errors.studentId?.message}
          required
          className="md:col-span-2"
        >
          {(control) => (
            <Controller
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <Combobox
                  {...control}
                  value={field.value || undefined}
                  onValueChange={(value) => field.onChange(value ?? '')}
                  onSearch={setSearch}
                  loading={students.isFetching}
                  placeholder={t.form.studentPlaceholder}
                  options={(students.data?.items ?? []).map((student) => ({
                    value: student.id,
                    label: `${student.fullName} · ${student.code}`,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        {studentId ? (
          <div className="rounded-md bg-canvas p-4 text-sm md:col-span-2">
            <p className="font-medium text-ink">
              {t.form.openCharges}: <span className="tabular">{formatMoney(openTotal)}</span>
            </p>
            <p className="mt-1 text-muted">
              {charges.data?.length ? t.form.allocation : t.form.noCharges}
            </p>
          </div>
        ) : null}
        <FormField label={t.form.amount} error={errors.amount?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('amount')}
              inputMode="decimal"
              dir="ltr"
              className="tabular"
            />
          )}
        </FormField>
        <FormField label={t.form.method} error={errors.method?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="method"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={PAYMENT_METHODS.map((method) => ({
                    value: method,
                    label: t.methods[method] ?? method,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.reference} error={errors.referenceNo?.message}>
          {(control) => <Input {...control} {...form.register('referenceNo')} dir="ltr" />}
        </FormField>
        <FormField label={t.form.notes} error={errors.notes?.message}>
          {(control) => <Textarea {...control} {...form.register('notes')} rows={2} />}
        </FormField>
      </FormSection>
    </FormPage>
  );
}
