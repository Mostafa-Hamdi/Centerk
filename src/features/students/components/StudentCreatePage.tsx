'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { useCreateStudentMutation } from '../api';
import {
  GUARDIAN_RELATIONS,
  studentFormSchema,
  type StudentFormInput,
  type StudentFormValues,
} from '../schemas';

const t = ar.students;
const REDIRECT_DELAY_MS = 1200;
const gradeOptions = t.grades.map((grade) => ({ value: grade, label: grade }));
const relationOptions = GUARDIAN_RELATIONS.map((relation) => ({
  value: relation,
  label: t.relations[relation],
}));
const serverFields = [
  'fullName',
  'phone',
  'grade',
  'guardian.fullName',
  'guardian.phone',
  'guardian.relation',
] as const;

/** /students/new — dedicated add page (section 6). Handles 409 duplicate-phone as a sibling prompt. */
export function StudentCreatePage() {
  const router = useRouter();
  const branchId = useAppSelector(selectCurrentBranchId);
  const [createStudent] = useCreateStudentMutation();
  const [siblingOf, setSiblingOf] = useState<StudentFormValues | null>(null);
  const form = useForm<StudentFormInput, unknown, StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      phone: '',
      grade: '',
      guardian: { fullName: '', phone: '', relation: undefined },
      guardianConsent: false,
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  const save = async (values: StudentFormValues, confirmSibling = false) => {
    try {
      await createStudent({
        fullName: values.fullName,
        phone: values.phone ?? null,
        grade: values.grade,
        branchId: branchId ?? undefined,
        guardian: values.guardian,
        guardianConsent: values.guardianConsent,
        confirmSibling,
      }).unwrap();
      toast.success(t.form.created, values.fullName);
      window.setTimeout(() => router.replace(routes.students.list), REDIRECT_DELAY_MS);
    } catch (error) {
      const problem = toProblem(error);
      if (problem.code === 'duplicate-phone' && !confirmSibling) {
        setSiblingOf(values);
      } else {
        applyServerErrors(problem, form.setError, serverFields);
        toast.error(problem.title, problem.detail);
      }
      throw error; // keeps isSubmitSuccessful false
    }
  };

  return (
    <>
      <FormPage
        title={t.addTitle}
        backHref={routes.students.list}
        onSubmit={(event) => {
          form
            .handleSubmit(
              (values) => save(values),
              toastInvalidForm,
            )(event)
            .catch(() => undefined);
        }}
        actions={
          <FormActions
            cancelHref={routes.students.list}
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

        <FormSection title={t.form.guardianSection} description={t.form.guardianSectionDesc}>
          <FormField
            label={t.form.guardianName}
            error={errors.guardian?.fullName?.message}
            required
          >
            {(control) => (
              <Input {...control} {...form.register('guardian.fullName')} autoComplete="off" />
            )}
          </FormField>
          <FormField label={t.form.guardianPhone} error={errors.guardian?.phone?.message} required>
            {(control) => (
              <Input
                {...control}
                {...form.register('guardian.phone')}
                type="tel"
                inputMode="tel"
                dir="ltr"
                placeholder="01XXXXXXXXX"
              />
            )}
          </FormField>
          <FormField label={t.form.relation} error={errors.guardian?.relation?.message} required>
            {(control) => (
              <Controller
                control={form.control}
                name="guardian.relation"
                render={({ field }) => (
                  <Select
                    {...control}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={relationOptions}
                    placeholder={t.form.relationPlaceholder}
                  />
                )}
              />
            )}
          </FormField>
          <div className="flex flex-col gap-1 md:col-span-2">
            <Controller
              control={form.control}
              name="guardianConsent"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label={t.form.consent}
                  aria-invalid={Boolean(errors.guardianConsent)}
                />
              )}
            />
            {errors.guardianConsent ? (
              <p role="alert" className="text-sm text-danger">
                {errors.guardianConsent.message}
              </p>
            ) : null}
          </div>
        </FormSection>
      </FormPage>

      <ConfirmDialog
        open={siblingOf !== null}
        onOpenChange={(open) => !open && setSiblingOf(null)}
        tone="warning"
        title={t.form.siblingTitle}
        questionPrefix={t.form.siblingQuestion}
        itemName={siblingOf?.guardian.fullName ?? ''}
        description={t.form.siblingDesc}
        confirmLabel={t.form.siblingConfirm}
        onConfirm={() => (siblingOf ? save(siblingOf, true) : Promise.resolve())}
      />
    </>
  );
}
