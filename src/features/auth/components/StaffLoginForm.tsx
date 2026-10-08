'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { FormField } from '@/components/form/FormField';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useLoginMutation } from '../api';
import { useCompleteLogin } from '../hooks/useCompleteLogin';
import { loginSchema } from '../schemas';

type LoginInput = z.input<typeof loginSchema>;
type LoginOutput = z.output<typeof loginSchema>;

const t = ar.auth.login;

/** "دخول الفريق": phone + password → BFF /api/auth/login. */
export function StaffLoginForm({ onFailure }: { onFailure: () => void }) {
  const [login] = useLoginMutation();
  const completeLogin = useCompleteLogin();
  const form = useForm<LoginInput, unknown, LoginOutput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { phone: '', password: '', rememberMe: true },
  });
  const { errors, isSubmitting, isSubmitSuccessful } = form.formState;

  const onValid = async (values: LoginOutput) => {
    try {
      await completeLogin(await login(values).unwrap());
    } catch (error) {
      const problem = toProblem(error);
      applyServerErrors(problem, form.setError, ['phone', 'password']);
      onFailure();
      if (problem.status === 401) {
        toast.error(ar.errors.invalidCredentials);
        form.setFocus('password');
      } else {
        toast.error(problem.title, problem.detail);
      }
      throw error; // keeps isSubmitSuccessful false
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        form
          .handleSubmit(onValid, (formErrors) => {
            onFailure();
            toastInvalidForm(formErrors);
          })(event)
          .catch(() => undefined);
      }}
      className="flex flex-col gap-5"
    >
      <FormField label={t.phone} error={errors.phone?.message} required>
        {(control) => (
          <Input
            {...control}
            {...form.register('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="01XXXXXXXXX"
            startAdornment={<Smartphone aria-hidden />}
          />
        )}
      </FormField>

      <FormField
        label={t.password}
        error={errors.password?.message}
        required
        labelAside={
          <Link
            href={routes.forgotPassword}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t.forgot}
          </Link>
        }
      >
        {(control) => (
          <PasswordInput
            {...control}
            {...form.register('password')}
            autoComplete="current-password"
          />
        )}
      </FormField>

      <Controller
        control={form.control}
        name="rememberMe"
        render={({ field }) => (
          <Checkbox checked={field.value} onCheckedChange={field.onChange} label={t.rememberMe} />
        )}
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isSubmitting || isSubmitSuccessful}
        iconStart={<LogIn aria-hidden />}
      >
        {t.submit}
      </Button>
    </form>
  );
}
