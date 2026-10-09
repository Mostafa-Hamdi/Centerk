'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { routes } from '@/config/routes';
import { newPasswordSchema } from '@/features/auth/schemas';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useChangePasswordMutation } from '../api';

const t = ar.account;

const schema = z
  .object({
    currentPassword: z.string().min(1, ar.validation.required),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: ar.validation.passwordMismatch,
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ['newPassword'],
    message: t.sameAsOld,
  });

type Values = z.infer<typeof schema>;

/** /account/password — PUT /me/password. */
export function ChangePasswordPage() {
  const router = useRouter();
  const [change] = useChangePasswordMutation();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  const save = async ({ currentPassword, newPassword }: Values) => {
    try {
      await change({ currentPassword, newPassword }).unwrap();
      toast.success(t.changed);
      router.replace(routes.dashboard);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['currentPassword', 'newPassword']);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={t.password}
      description={t.passwordDesc}
      backHref={routes.dashboard}
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
          cancelHref={routes.dashboard}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.password} columns={1}>
        {(
          [
            ['currentPassword', t.current, 'current-password'],
            ['newPassword', t.next, 'new-password'],
            ['confirmPassword', t.confirm, 'new-password'],
          ] as const
        ).map(([name, label, autoComplete]) => (
          <FormField key={name} label={label} error={errors[name]?.message} required>
            {(control) => (
              <PasswordInput {...control} {...form.register(name)} autoComplete={autoComplete} />
            )}
          </FormField>
        ))}
      </FormSection>
    </FormPage>
  );
}
