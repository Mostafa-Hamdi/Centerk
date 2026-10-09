'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useCreateExpenseMutation,
  useGetCurrentShiftQuery,
  useGetExpenseCategoriesQuery,
  useGetExpenseQuery,
  useUpdateExpenseMutation,
} from '../api';

const t = ar.expenses;
const v = ar.validation;

/** Swagger ExpenseRequest: category + description required, amount > 0. */
const expenseSchema = z.object({
  category: z.string().trim().min(1, v.required).max(100, v.tooLong(100)),
  description: z.string().trim().min(1, v.required).max(500, v.tooLong(500)),
  amount: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(
      z.number({ error: v.number }).positive(v.minValue(1)).max(1_000_000, v.maxValue(1_000_000)),
    ),
});

type ExpenseInput = z.input<typeof expenseSchema>;
type ExpenseValues = z.output<typeof expenseSchema>;

/** /expenses/new and /expenses/[id]/edit — an expense against the open cash shift (if any). */
export function ExpenseFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const branchId = useAppSelector(selectCurrentBranchId);
  const shift = useGetCurrentShiftQuery(undefined);
  const categories = useGetExpenseCategoriesQuery(undefined);
  const [create] = useCreateExpenseMutation();
  const [update] = useUpdateExpenseMutation();
  const expense = useGetExpenseQuery(id ?? '', { skip: !id });
  const form = useForm<ExpenseInput, unknown, ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    mode: 'onBlur',
    defaultValues: { category: '', description: '', amount: '' },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;
  const categoryOptions = (categories.data ?? []).map((category) => ({
    value: category.name,
    label: category.name,
  }));

  useEffect(() => {
    if (expense.data) {
      form.reset({
        category: expense.data.category,
        description: expense.data.description ?? '',
        amount: String(expense.data.amount),
      });
    }
  }, [expense.data, form]);

  if (id && expense.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void expense.refetch()} />;
  if (id && !expense.data)
    return <Skeleton className="mx-auto h-[24rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: ExpenseValues) => {
    try {
      const body = {
        ...values,
        branchId: branchId ?? undefined,
        cashShiftId: expense.data?.cashShiftId ?? shift.data?.id,
      };
      await (id ? update({ id, ...body }) : create(body)).unwrap();
      toast.success(t.form.done, `${values.category} · ${formatMoney(values.amount)}`);
      router.replace(routes.expenses.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['category', 'description', 'amount']);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.title}
      description={shift.data ? t.form.shift : t.form.noShift}
      backHref={routes.expenses.list}
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
          cancelHref={routes.expenses.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
          submitLabel={id ? ar.common.save : t.form.submit}
        />
      }
    >
      <FormSection title={t.form.title}>
        <FormField label={t.form.category} error={errors.category?.message} required>
          {(control) =>
            categoryOptions.length ? (
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select
                    {...control}
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    placeholder={t.form.categoryPlaceholder}
                    options={categoryOptions}
                  />
                )}
              />
            ) : (
              <Input {...control} {...form.register('category')} />
            )
          }
        </FormField>
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
        <FormField
          label={t.form.description}
          error={errors.description?.message}
          required
          className="md:col-span-2"
        >
          {(control) => <Textarea {...control} {...form.register('description')} rows={3} />}
        </FormField>
      </FormSection>
    </FormPage>
  );
}
