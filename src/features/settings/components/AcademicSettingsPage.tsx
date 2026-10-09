'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarRange, GraduationCap, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDate } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  GRADE_STAGES,
  TERM_STATUSES,
  useDeleteAcademicTermMutation,
  useDeleteGradeLevelMutation,
  useGetAcademicTermsQuery,
  useGetGradeLevelsSettingsQuery,
  useSaveAcademicTermMutation,
  useSaveGradeLevelMutation,
} from '../api';
import { SettingsHeader } from './SettingsHeader';

const t = ar.settings;
const v = ar.validation;

/** /settings/grade-levels — grade levels and academic terms. */
export function AcademicSettingsPage() {
  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <SettingsHeader />
      <div className="grid items-start gap-(--shell-gap) xl:grid-cols-2">
        <GradesCard />
        <TermsCard />
      </div>
    </div>
  );
}

const gradeSchema = z.object({
  name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
  stage: z.enum(GRADE_STAGES),
  sortOrder: z
    .string()
    .trim()
    .transform((value) => (value === '' ? 0 : Number(value)))
    .pipe(
      z
        .number({ error: v.number })
        .int(v.wholeNumber)
        .min(0, v.minValue(0))
        .max(100, v.maxValue(100)),
    ),
});

function GradesCard() {
  const { data, error, refetch, isLoading } = useGetGradeLevelsSettingsQuery(undefined);
  const [save] = useSaveGradeLevelMutation();
  const [remove] = useDeleteGradeLevelMutation();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const form = useForm<z.input<typeof gradeSchema>, unknown, z.output<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: { name: '', stage: 'Secondary', sortOrder: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const add = async (values: z.output<typeof gradeSchema>) => {
    try {
      await save({ ...values, isActive: true }).unwrap();
      toast.success(t.grades.saved, values.name);
      form.reset({ name: '', stage: values.stage, sortOrder: '' });
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'stage', 'sortOrder']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <GraduationCap className="size-5 text-muted" aria-hidden />
        {t.grades.title}
      </h2>
      <Can permission="settings.update">
        <form
          noValidate
          className="grid items-end gap-3 rounded-md bg-canvas p-4 sm:grid-cols-4"
          onSubmit={(event) => {
            form
              .handleSubmit(
                add,
                toastInvalidForm,
              )(event)
              .catch(() => undefined);
          }}
        >
          <FormField label={t.grades.name} error={errors.name?.message} required>
            {(control) => <Input {...control} {...form.register('name')} />}
          </FormField>
          <FormField label={t.grades.stage} error={errors.stage?.message} required>
            {(control) => (
              <Controller
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <Select
                    {...control}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={GRADE_STAGES.map((stage) => ({
                      value: stage,
                      label: t.grades.stages[stage] ?? stage,
                    }))}
                  />
                )}
              />
            )}
          </FormField>
          <FormField label={t.grades.order} error={errors.sortOrder?.message}>
            {(control) => (
              <Input {...control} {...form.register('sortOrder')} inputMode="numeric" dir="ltr" />
            )}
          </FormField>
          <Button type="submit" loading={isSubmitting}>
            {t.grades.add}
          </Button>
        </form>
      </Can>
      {error ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-32 w-full rounded-md" />
      ) : data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.map((grade) => (
            <li key={grade.id} className="flex items-center justify-between gap-3 py-3">
              <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                {grade.name}
                {grade.stage ? (
                  <Badge tone="info">{t.grades.stages[grade.stage] ?? grade.stage}</Badge>
                ) : null}
                {grade.isActive ? null : <Badge>{t.grades.inactive}</Badge>}
              </p>
              <Can permission="settings.update">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`${ar.common.delete} ${grade.name}`}
                  iconStart={<Trash2 aria-hidden />}
                  onClick={() => setDeleting(grade)}
                />
              </Can>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={GraduationCap} title={t.grades.empty} />
      )}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(t.grades.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </Card>
  );
}

const termSchema = z
  .object({
    name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
    startDate: z.string().min(1, v.required),
    endDate: z.string().min(1, v.required),
    status: z.enum(TERM_STATUSES),
  })
  .refine((value) => value.endDate > value.startDate, {
    path: ['endDate'],
    message: t.terms.endAfterStart,
  });

type TermValues = z.infer<typeof termSchema>;
const termTones = { Upcoming: 'info', Current: 'success', Finished: 'neutral' } as const;

function TermsCard() {
  const { data, error, refetch, isLoading } = useGetAcademicTermsQuery(undefined);
  const [save] = useSaveAcademicTermMutation();
  const [remove] = useDeleteAcademicTermMutation();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const form = useForm<TermValues>({
    resolver: zodResolver(termSchema),
    defaultValues: { name: '', startDate: '', endDate: '', status: 'Upcoming' },
  });
  const { errors, isSubmitting } = form.formState;

  const add = async (values: TermValues) => {
    try {
      await save(values).unwrap();
      toast.success(t.terms.saved, values.name);
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'startDate', 'endDate', 'status']);
      toast.error(problem.title, problem.detail);
    }
  };

  const datePicker = (name: 'startDate' | 'endDate', label: string) => (
    <FormField label={label} error={errors[name]?.message} required>
      {(control) => (
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <DatePicker {...control} value={field.value} onChange={field.onChange} />
          )}
        />
      )}
    </FormField>
  );

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <CalendarRange className="size-5 text-muted" aria-hidden />
        {t.terms.title}
      </h2>
      <Can permission="settings.update">
        <form
          noValidate
          className="grid items-end gap-3 rounded-md bg-canvas p-4 sm:grid-cols-2"
          onSubmit={(event) => {
            form
              .handleSubmit(
                add,
                toastInvalidForm,
              )(event)
              .catch(() => undefined);
          }}
        >
          <FormField label={t.terms.name} error={errors.name?.message} required>
            {(control) => <Input {...control} {...form.register('name')} />}
          </FormField>
          <FormField label={t.terms.status} error={errors.status?.message} required>
            {(control) => (
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    {...control}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={TERM_STATUSES.map((status) => ({
                      value: status,
                      label: t.terms.statuses[status] ?? status,
                    }))}
                  />
                )}
              />
            )}
          </FormField>
          {datePicker('startDate', t.terms.start)}
          {datePicker('endDate', t.terms.end)}
          <Button type="submit" loading={isSubmitting}>
            {t.terms.add}
          </Button>
        </form>
      </Can>
      {error ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-32 w-full rounded-md" />
      ) : data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.map((term) => {
            const status = TERM_STATUSES.find((value) => value === term.status);
            return (
              <li key={term.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="flex items-center gap-2 font-medium text-ink">
                    {term.name}
                    <Badge tone={status ? termTones[status] : 'neutral'} dot>
                      {t.terms.statuses[term.status] ?? term.status}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted">
                    {term.startDate ? formatDate(term.startDate) : '—'} ←{' '}
                    {term.endDate ? formatDate(term.endDate) : '—'}
                  </p>
                </div>
                <Can permission="settings.update">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${ar.common.delete} ${term.name}`}
                    iconStart={<Trash2 aria-hidden />}
                    onClick={() => setDeleting(term)}
                  />
                </Can>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={CalendarRange} title={t.terms.empty} />
      )}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(t.terms.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </Card>
  );
}
