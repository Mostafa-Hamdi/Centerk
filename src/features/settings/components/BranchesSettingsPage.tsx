'use client';

import { ExportButton } from '@/components/data/ExportButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Building2, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { phoneSchema } from '@/features/auth/schemas';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatMoney, formatPhone } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useDeleteBranchMutation,
  useDeleteSubjectMutation,
  useGetBranchesQuery,
  useGetSubjectsSettingsQuery,
  useSaveBranchMutation,
  useSaveSubjectMutation,
  type BranchDto,
  type SubjectDto,
} from '../api';
import { SettingsHeader } from './SettingsHeader';

const t = ar.settings;
const v = ar.validation;

/** /settings/branches — branches and subjects (quick add, open/close, delete). */
export function BranchesSettingsPage() {
  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <SettingsHeader />
      <div className="grid items-start gap-(--shell-gap) xl:grid-cols-2">
        <BranchesCard />
        <SubjectsCard />
      </div>
    </div>
  );
}

const branchSchema = z.object({
  name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
  address: z.string().trim().max(200, v.tooLong(200)),
  phone: z.union([z.literal(''), phoneSchema]),
});

type BranchValues = z.infer<typeof branchSchema>;

function BranchesCard() {
  const { data, error, refetch, isLoading } = useGetBranchesQuery(undefined);
  const [saveBranch] = useSaveBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();
  const [deleting, setDeleting] = useState<BranchDto | null>(null);
  const [editing, setEditing] = useState<BranchDto | null>(null);
  const form = useForm<BranchValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: '', address: '', phone: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const add = async (values: BranchValues) => {
    try {
      await saveBranch({
        id: editing?.id,
        name: values.name,
        address: values.address || null,
        phone: values.phone || null,
        isOpen: editing?.isOpen ?? true,
      }).unwrap();
      toast.success(t.branches.saved, values.name);
      setEditing(null);
      form.reset({ name: '', address: '', phone: '' });
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'address', 'phone']);
      toast.error(problem.title, problem.detail);
    }
  };

  const toggle = async (branch: BranchDto, isOpen: boolean) => {
    try {
      await saveBranch({ ...branch, isOpen }).unwrap();
      toast.success(t.branches.toggled(isOpen), branch.name);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Building2 className="size-5 text-muted" aria-hidden />
        {t.branches.title}
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
          <FormField label={t.branches.name} error={errors.name?.message} required>
            {(control) => <Input {...control} {...form.register('name')} />}
          </FormField>
          <FormField label={t.branches.phone} error={errors.phone?.message}>
            {(control) => (
              <Input {...control} {...form.register('phone')} inputMode="tel" dir="ltr" />
            )}
          </FormField>
          <FormField label={t.branches.address} error={errors.address?.message}>
            {(control) => <Input {...control} {...form.register('address')} />}
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" loading={isSubmitting}>
              {editing ? ar.common.save : t.branches.add}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  form.reset({ name: '', address: '', phone: '' });
                }}
              >
                {ar.common.cancel}
              </Button>
            ) : null}
          </div>
        </form>
      </Can>
      {error ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-32 w-full rounded-md" />
      ) : data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.map((branch) => (
            <li key={branch.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="flex items-center gap-2 font-medium text-ink">
                  {branch.name}
                  <Badge tone={branch.isOpen ? 'success' : 'neutral'} dot>
                    {branch.isOpen ? t.branches.open : t.branches.closed}
                  </Badge>
                </p>
                <p className="text-xs text-muted">
                  {[branch.address, branch.phone ? formatPhone(branch.phone) : null]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>
              </div>
              <Can permission="settings.update">
                <div className="flex items-center gap-1">
                  <Switch
                    checked={branch.isOpen}
                    onCheckedChange={(checked) => void toggle(branch, checked)}
                    label={<span className="sr-only">{`${t.branches.open}: ${branch.name}`}</span>}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${ar.common.edit} ${branch.name}`}
                    iconStart={<Pencil aria-hidden />}
                    onClick={() => {
                      setEditing(branch);
                      form.reset({
                        name: branch.name,
                        address: branch.address ?? '',
                        phone: branch.phone ?? '',
                      });
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${ar.common.delete} ${branch.name}`}
                    iconStart={<Trash2 aria-hidden />}
                    onClick={() => setDeleting(branch)}
                  />
                </div>
              </Can>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Building2} title={t.branches.empty} />
      )}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        requireTypedName
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteBranch(deleting.id).unwrap();
            toast.success(t.branches.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </Card>
  );
}

const subjectSchema = z.object({
  name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
  defaultPrice: z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : Number(value)))
    .pipe(
      z
        .number({ error: v.number })
        .min(0, v.minValue(0))
        .max(100_000, v.maxValue(100_000))
        .nullable(),
    ),
});

type SubjectInput = z.input<typeof subjectSchema>;
type SubjectValues = z.output<typeof subjectSchema>;

function SubjectsCard() {
  const { data, error, refetch, isLoading } = useGetSubjectsSettingsQuery(undefined);
  const [saveSubject] = useSaveSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleting, setDeleting] = useState<SubjectDto | null>(null);
  const [editing, setEditing] = useState<SubjectDto | null>(null);
  const form = useForm<SubjectInput, unknown, SubjectValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '', defaultPrice: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const add = async (values: SubjectValues) => {
    try {
      await saveSubject({
        id: editing?.id,
        ...values,
        isActive: editing?.isActive ?? true,
      }).unwrap();
      toast.success(t.subjects.saved, values.name);
      setEditing(null);
      form.reset({ name: '', defaultPrice: '' });
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'defaultPrice']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <BookOpen className="size-5 text-muted" aria-hidden />
        {t.subjects.title}
      </h2>
      <Can permission="settings.view">
        <div>
          <ExportButton path="/subjects/export" params={{}} fileName="subjects" />
        </div>
      </Can>
      <Can permission="settings.update">
        <form
          noValidate
          className="grid items-end gap-3 rounded-md bg-canvas p-4 sm:grid-cols-3"
          onSubmit={(event) => {
            form
              .handleSubmit(
                add,
                toastInvalidForm,
              )(event)
              .catch(() => undefined);
          }}
        >
          <FormField label={t.subjects.name} error={errors.name?.message} required>
            {(control) => <Input {...control} {...form.register('name')} />}
          </FormField>
          <FormField label={t.subjects.price} error={errors.defaultPrice?.message}>
            {(control) => (
              <Input
                {...control}
                {...form.register('defaultPrice')}
                inputMode="decimal"
                dir="ltr"
                className="tabular"
              />
            )}
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" loading={isSubmitting}>
              {editing ? ar.common.save : t.subjects.add}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  form.reset({ name: '', defaultPrice: '' });
                }}
              >
                {ar.common.cancel}
              </Button>
            ) : null}
          </div>
        </form>
      </Can>
      {error ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-32 w-full rounded-md" />
      ) : data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.map((subject) => (
            <li key={subject.id} className="flex items-center justify-between gap-3 py-3">
              <p className="flex items-center gap-2 font-medium text-ink">
                {subject.name}
                {subject.isActive ? null : <Badge>{t.subjects.inactive}</Badge>}
                {subject.defaultPrice !== null ? (
                  <span className="text-sm font-normal text-muted tabular">
                    {formatMoney(subject.defaultPrice)}
                  </span>
                ) : null}
              </p>
              <Can permission="settings.update">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${ar.common.edit} ${subject.name}`}
                    iconStart={<Pencil aria-hidden />}
                    onClick={() => {
                      setEditing(subject);
                      form.reset({
                        name: subject.name,
                        defaultPrice:
                          subject.defaultPrice === null ? '' : String(subject.defaultPrice),
                      });
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${ar.common.delete} ${subject.name}`}
                    iconStart={<Trash2 aria-hidden />}
                    onClick={() => setDeleting(subject)}
                  />
                </div>
              </Can>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={BookOpen} title={t.subjects.empty} />
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
            await deleteSubject(deleting.id).unwrap();
            toast.success(t.subjects.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </Card>
  );
}
