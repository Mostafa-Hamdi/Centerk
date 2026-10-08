'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useCreateGroupMutation,
  useGetGroupQuery,
  useGetHallsQuery,
  useUpdateGroupMutation,
} from '../api';
import { groupFormSchema, type GroupFormInput, type GroupFormValues } from '../schemas';

const t = ar.groups;
const REDIRECT_DELAY_MS = 1200;
const gradeOptions = ar.students.grades.map((grade) => ({ value: grade, label: grade }));
const serverFields = [
  'name',
  'subject',
  'grade',
  'capacity',
  'price',
  'hallId',
  'teacherId',
] as const;

/**
 * /groups/new and /groups/[id]/edit (one component). Create → Swagger NewGroup,
 * edit → UpdateGroupRequest (name, capacity, monthlyPrice, hall). Subject/grade are fixed after creation.
 */
export function GroupFormPage({ id }: { id?: string }) {
  const editing = Boolean(id);
  const router = useRouter();
  const branchId = useAppSelector(selectCurrentBranchId);
  const group = useGetGroupQuery(id ?? '', { skip: !id });
  const halls = useGetHallsQuery(branchId ?? undefined);
  const [createGroup] = useCreateGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const form = useForm<GroupFormInput, unknown, GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      subject: '',
      grade: '',
      capacity: '',
      price: '',
      hallId: '',
      teacherId: '',
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    if (group.data) {
      form.reset({
        name: group.data.name,
        subject: group.data.subject,
        grade: group.data.grade,
        capacity: group.data.capacity === null ? '' : String(group.data.capacity),
        price: String(group.data.price),
        hallId: group.data.hallId ?? '',
        teacherId: group.data.teacherId ?? '',
      });
    }
  }, [group.data, form]);

  if (editing && group.error) {
    return (
      <ErrorState
        title={toProblem(group.error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void group.refetch()}
      />
    );
  }
  if (editing && !group.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: GroupFormValues) => {
    try {
      if (id) {
        await updateGroup({
          id,
          body: {
            name: values.name,
            capacity: values.capacity,
            monthlyPrice: values.price,
            hallId: values.hallId,
            teacherId: values.teacherId,
          },
        }).unwrap();
        toast.success(t.form.updated, values.name);
      } else {
        await createGroup({
          name: values.name,
          subject: values.subject,
          grade: values.grade,
          price: values.price,
          capacity: values.capacity,
          hallId: values.hallId,
          teacherId: values.teacherId,
          branchId: branchId ?? undefined,
        }).unwrap();
        toast.success(t.form.created, values.name);
      }
      window.setTimeout(() => router.replace(routes.groups.list), REDIRECT_DELAY_MS);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, serverFields);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  const hallOptions = (halls.data ?? []).map((hall) => ({
    value: hall.id,
    label: hall.capacity ? `${hall.name} (${hall.capacity})` : hall.name,
  }));

  return (
    <FormPage
      title={id && group.data ? t.editTitle(group.data.name) : t.addTitle}
      backHref={id ? routes.groups.detail(id) : routes.groups.list}
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
          cancelHref={id ? routes.groups.detail(id) : routes.groups.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.section} description={t.form.sectionDesc}>
        <FormField
          label={t.form.name}
          error={errors.name?.message}
          required
          className="md:col-span-2"
        >
          {(control) => (
            <Input
              {...control}
              {...form.register('name')}
              placeholder={t.form.namePlaceholder}
              autoComplete="off"
            />
          )}
        </FormField>
        <FormField label={t.form.subject} error={errors.subject?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('subject')}
              disabled={editing}
              autoComplete="off"
            />
          )}
        </FormField>
        <FormField label={t.form.grade} error={errors.grade?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="grade"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  options={gradeOptions}
                  placeholder={ar.students.form.gradePlaceholder}
                  disabled={editing}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.price} error={errors.price?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('price')}
              inputMode="decimal"
              dir="ltr"
              className="tabular"
            />
          )}
        </FormField>
      </FormSection>

      <FormSection title={t.form.placeSection}>
        <FormField label={t.form.hall} error={errors.hallId?.message}>
          {(control) => (
            <Controller
              control={form.control}
              name="hallId"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  options={hallOptions}
                  placeholder={t.form.hallPlaceholder}
                />
              )}
            />
          )}
        </FormField>
        <FormField
          label={t.form.capacity}
          hint={t.form.capacityHint}
          error={errors.capacity?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...form.register('capacity')}
              inputMode="numeric"
              dir="ltr"
              className="tabular"
            />
          )}
        </FormField>
      </FormSection>
    </FormPage>
  );
}
