'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileSignature, GraduationCap, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Can } from '@/features/auth/components/Can';
import { phoneSchema } from '@/features/auth/schemas';
import { useGetSubjectsQuery } from '@/features/questions/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDate, formatNumber, formatPhone } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  AGREEMENT_TYPES,
  useAddAgreementMutation,
  useDeleteTeacherMutation,
  useGetAgreementsQuery,
  useGetTeachersQuery,
  useSaveTeacherMutation,
  type TeacherDto,
} from '../teachersApi';
import { CentersTabs } from './CentersTabs';

const t = ar.teachers;
const v = ar.validation;

const teacherSchema = z.object({
  fullName: z.string().trim().min(3, v.fullName).max(100, v.tooLong(100)),
  phone: phoneSchema,
  subjectId: z.string().min(1, v.required),
});
type TeacherValues = z.infer<typeof teacherSchema>;
const EMPTY: TeacherValues = { fullName: '', phone: '', subjectId: '' };

/** /centers/teachers — external teachers (quick add / edit / delete) and their agreements. */
export function TeachersPage() {
  const { data, error, refetch, isLoading } = useGetTeachersQuery({ page: 1, pageSize: 100 });
  const subjects = useGetSubjectsQuery(undefined);
  const [save] = useSaveTeacherMutation();
  const [remove] = useDeleteTeacherMutation();
  const [editing, setEditing] = useState<TeacherDto | null>(null);
  const [deleting, setDeleting] = useState<TeacherDto | null>(null);
  const [selected, setSelected] = useState<TeacherDto | null>(null);
  const form = useForm<TeacherValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: EMPTY,
  });
  const { errors, isSubmitting } = form.formState;
  const subjectName = (id: string | null) =>
    (id && subjects.data?.find((subject) => subject.id === id)?.name) ?? '—';

  const submit = async (values: TeacherValues) => {
    try {
      await save({ id: editing?.id, ...values, isActive: editing?.isActive ?? true }).unwrap();
      toast.success(t.saved, values.fullName);
      setEditing(null);
      form.reset(EMPTY);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['fullName', 'phone', 'subjectId']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>
      <CentersTabs />

      <Can permission="centers.teachers">
        <Card className="p-4">
          <form
            noValidate
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  submit,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            <FormField label={t.name} error={errors.fullName?.message} required>
              {(control) => <Input {...control} {...form.register('fullName')} />}
            </FormField>
            <FormField label={t.phone} error={errors.phone?.message} required>
              {(control) => (
                <Input {...control} {...form.register('phone')} inputMode="tel" dir="ltr" />
              )}
            </FormField>
            <FormField label={t.subject} error={errors.subjectId?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <Select
                      {...control}
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      options={(subjects.data ?? []).map((subject) => ({
                        value: subject.id,
                        label: subject.name,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <div className="flex gap-2">
              <Button type="submit" loading={isSubmitting}>
                {editing ? t.save : t.add}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="ghost"
                  iconStart={<X aria-hidden />}
                  onClick={() => {
                    setEditing(null);
                    form.reset(EMPTY);
                  }}
                >
                  {ar.common.cancel}
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </Can>

      <div className="grid items-start gap-(--shell-gap) xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {error ? (
          <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : data?.items.length ? (
          <ul className="flex flex-col gap-3">
            {data.items.map((teacher) => (
              <li key={teacher.id}>
                <Card
                  className={
                    selected?.id === teacher.id
                      ? 'flex flex-wrap items-center justify-between gap-3 border-primary p-4'
                      : 'flex flex-wrap items-center justify-between gap-3 p-4'
                  }
                >
                  <div>
                    <p className="flex items-center gap-2 font-medium text-ink">
                      {teacher.fullName}
                      <Badge tone="info">{subjectName(teacher.subjectId)}</Badge>
                    </p>
                    <p dir="ltr" className="text-start text-xs text-muted tabular">
                      {teacher.phone ? formatPhone(teacher.phone) : '—'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={selected?.id === teacher.id ? 'primary' : 'info'}
                      iconStart={<FileSignature aria-hidden />}
                      onClick={() => setSelected(teacher)}
                    >
                      {t.manage}
                    </Button>
                    <Can permission="centers.teachers">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`${ar.common.edit} ${teacher.fullName}`}
                        iconStart={<Pencil aria-hidden />}
                        onClick={() => {
                          setEditing(teacher);
                          form.reset({
                            fullName: teacher.fullName,
                            phone: teacher.phone ?? '',
                            subjectId: teacher.subjectId ?? '',
                          });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`${ar.common.delete} ${teacher.fullName}`}
                        iconStart={<Trash2 aria-hidden />}
                        onClick={() => setDeleting(teacher)}
                      />
                    </Can>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={GraduationCap} title={t.empty} />
        )}

        {selected ? <AgreementsPanel teacher={selected} /> : null}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.fullName ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(t.deleted, deleting.fullName);
            if (selected?.id === deleting.id) setSelected(null);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}

const agreementSchema = z.object({
  type: z.enum(AGREEMENT_TYPES),
  value: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(
      z.number({ error: v.number }).positive(v.minValue(1)).max(1_000_000, v.maxValue(1_000_000)),
    ),
  effectiveFrom: z.string().min(1, v.required),
});

function AgreementsPanel({ teacher }: { teacher: TeacherDto }) {
  const { data, isLoading } = useGetAgreementsQuery(teacher.id);
  const [add] = useAddAgreementMutation();
  const form = useForm<z.input<typeof agreementSchema>, unknown, z.output<typeof agreementSchema>>({
    resolver: zodResolver(agreementSchema),
    defaultValues: { type: 'Percentage', value: '', effectiveFrom: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = async (values: z.output<typeof agreementSchema>) => {
    try {
      await add({ teacherId: teacher.id, ...values }).unwrap();
      toast.success(t.agreementAdded, teacher.fullName);
      form.reset({ type: values.type, value: '', effectiveFrom: '' });
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['type', 'value', 'effectiveFrom']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5 xl:sticky xl:top-24">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <FileSignature className="size-5 text-primary" aria-hidden />
        {t.agreementsOf(teacher.fullName)}
      </h2>
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-md" />
      ) : data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.map((agreement) => (
            <li key={agreement.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="font-medium text-ink">
                {t.types[agreement.type] ?? agreement.type}:{' '}
                <span className="tabular">{formatNumber(agreement.value)}</span>
              </span>
              <span className="text-xs text-muted">
                {agreement.effectiveFrom ? formatDate(agreement.effectiveFrom) : '—'} ·{' '}
                {agreement.effectiveTo ? t.ended(formatDate(agreement.effectiveTo)) : t.current}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md bg-warning-tint p-3 text-sm text-warning">{t.noAgreements}</p>
      )}

      <Can permission="centers.teachers">
        <form
          noValidate
          className="grid items-end gap-3 rounded-md bg-canvas p-3 sm:grid-cols-2"
          onSubmit={(event) => {
            form
              .handleSubmit(
                submit,
                toastInvalidForm,
              )(event)
              .catch(() => undefined);
          }}
        >
          <FormField label={t.agreementType} error={errors.type?.message} required>
            {(control) => (
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select
                    {...control}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={AGREEMENT_TYPES.map((type) => ({
                      value: type,
                      label: t.types[type] ?? type,
                    }))}
                  />
                )}
              />
            )}
          </FormField>
          <FormField label={t.value} error={errors.value?.message} required>
            {(control) => (
              <Input {...control} {...form.register('value')} inputMode="decimal" dir="ltr" />
            )}
          </FormField>
          <FormField label={t.from} error={errors.effectiveFrom?.message} required>
            {(control) => (
              <Input {...control} {...form.register('effectiveFrom')} type="date" dir="ltr" />
            )}
          </FormField>
          <Button type="submit" loading={isSubmitting}>
            {t.addAgreement}
          </Button>
        </form>
      </Can>
    </Card>
  );
}
