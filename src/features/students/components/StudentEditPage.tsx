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
import { useGetStudentQuery, useUpdateStudentMutation } from '../api';
import { studentEditSchema, type StudentEditInput, type StudentEditValues } from '../schemas';

const t = ar.students;
const REDIRECT_DELAY_MS = 1200;
const gradeOptions = t.grades.map((grade) => ({ value: grade, label: grade }));

/** /students/[id]/edit — dedicated edit page (Swagger EditStudent: fullName, phone, grade). */
export function StudentEditPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: student, isLoading, error, refetch } = useGetStudentQuery(id);
  const [updateStudent] = useUpdateStudentMutation();
  const form = useForm<StudentEditInput, unknown, StudentEditValues>({
    resolver: zodResolver(studentEditSchema),
    mode: 'onBlur',
    defaultValues: { fullName: '', phone: '', grade: '' },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    if (student) {
      form.reset({
        fullName: student.fullName,
        phone: student.phone ?? '',
        grade: student.grade ?? '',
      });
    }
  }, [student, form]);

  if (error) {
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  }
  if (isLoading || !student)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: StudentEditValues) => {
    try {
      await updateStudent({
        id,
        body: { fullName: values.fullName, phone: values.phone ?? null, grade: values.grade },
      }).unwrap();
      toast.success(t.form.updated, values.fullName);
      window.setTimeout(() => router.replace(routes.students.list), REDIRECT_DELAY_MS);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['fullName', 'phone', 'grade']);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={t.editTitle(student.fullName)}
      backHref={routes.students.detail(id)}
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
          cancelHref={routes.students.detail(id)}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.studentSection} description={t.form.studentSectionDesc}>
        <FormField
          label={t.form.fullName}
          error={errors.fullName?.message}
          required
          className="md:col-span-2"
        >
          {(control) => <Input {...control} {...form.register('fullName')} autoComplete="off" />}
        </FormField>
        <FormField label={t.form.phone} error={errors.phone?.message}>
          {(control) => (
            <Input
              {...control}
              {...form.register('phone')}
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="01XXXXXXXXX"
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
                  placeholder={t.form.gradePlaceholder}
                />
              )}
            />
          )}
        </FormField>
      </FormSection>
    </FormPage>
  );
}
