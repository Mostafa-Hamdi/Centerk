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
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { newPasswordSchema, phoneSchema } from '@/features/auth/schemas';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { STAFF_ROLES, useGetStaffMemberQuery, useSaveStaffMutation } from '../api';

const t = ar.staff;
const v = ar.validation;

/** Swagger NewStaffV1 / StaffEditRequest. */
const staffSchema = z.object({
  name: z.string().trim().min(3, v.fullName).max(100, v.tooLong(100)),
  phone: phoneSchema,
  email: z.union([z.literal(''), z.email()]),
  role: z.enum(STAFF_ROLES),
  /** Only validated when creating (see save). */
  password: z.string(),
});

type StaffValues = z.infer<typeof staffSchema>;

/** /staff/new and /staff/[id]/edit — the new member gets an activation link (backend). */
export function StaffFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const branchId = useAppSelector(selectCurrentBranchId);
  const member = useGetStaffMemberQuery(id ?? '', { skip: !id });
  const [saveStaff] = useSaveStaffMutation();
  const form = useForm<StaffValues>({
    resolver: zodResolver(staffSchema),
    mode: 'onBlur',
    defaultValues: { name: '', phone: '', email: '', role: 'Teacher', password: '' },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    const data = member.data;
    if (!data) return;
    form.reset({
      name: data.name,
      phone: data.phone ?? '',
      email: data.email ?? '',
      role: STAFF_ROLES.find((role) => role === data.role) ?? 'Teacher',
      password: '',
    });
  }, [member.data, form]);

  if (id && member.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void member.refetch()} />;
  if (id && !member.data)
    return <Skeleton className="mx-auto h-[24rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: StaffValues) => {
    try {
      if (!id) {
        const password = newPasswordSchema.safeParse(values.password);
        if (!password.success) {
          form.setError('password', { message: password.error.issues[0]?.message });
          return;
        }
      }
      await saveStaff({
        id,
        ...values,
        email: values.email || null,
        password: id ? undefined : values.password,
        branchId: member.data?.branchId ?? branchId ?? undefined,
      }).unwrap();
      toast.success(id ? t.form.updated : t.form.created, id ? values.name : t.form.createdHint);
      router.replace(routes.staff.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'phone', 'email', 'role']);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      backHref={routes.staff.list}
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
          cancelHref={routes.staff.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.basics}>
        <FormField label={t.form.name} error={errors.name?.message} required>
          {(control) => <Input {...control} {...form.register('name')} autoComplete="name" />}
        </FormField>
        <FormField label={t.form.phone} error={errors.phone?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('phone')}
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
            />
          )}
        </FormField>
        <FormField label={t.form.email} error={errors.email?.message}>
          {(control) => (
            <Input
              {...control}
              {...form.register('email')}
              type="email"
              dir="ltr"
              autoComplete="email"
            />
          )}
        </FormField>
        {id ? null : (
          <FormField
            label={t.form.password}
            hint={t.form.passwordHint}
            error={errors.password?.message}
            required
          >
            {(control) => (
              <PasswordInput
                {...control}
                {...form.register('password')}
                autoComplete="new-password"
              />
            )}
          </FormField>
        )}
        <FormField label={t.form.role} error={errors.role?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={STAFF_ROLES.map((role) => ({
                    value: role,
                    label: t.roles[role] ?? role,
                  }))}
                />
              )}
            />
          )}
        </FormField>
      </FormSection>
    </FormPage>
  );
}
