'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, KeyRound, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { FormField } from '@/components/form/FormField';
import { toast } from '@/components/feedback/toast';
import { Button, buttonVariants } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useResetPasswordMutation } from '../api';
import { useShake } from '../hooks/useShake';
import { resetPasswordSchema } from '../schemas';
import { AuthCard } from './AuthCard';
import { TenantSlugField } from './TenantSlugField';

type ResetInput = z.input<typeof resetPasswordSchema>;
type ResetOutput = z.output<typeof resetPasswordSchema>;

const t = ar.auth.reset;
const REDIRECT_DELAY_MS = 1200;

const rules = [
  { label: t.rules.length, test: (value: string) => value.length >= 8 },
  { label: t.rules.letter, test: (value: string) => /\p{L}/u.test(value) },
  { label: t.rules.digit, test: (value: string) => /\d/.test(value) },
];

/** Opened from the WhatsApp link: /reset-password?token=… → POST /auth/password/reset. */
export function ResetPasswordForm({
  token,
  tenant,
}: {
  token: string | null;
  tenant?: string | null;
}) {
  const router = useRouter();
  const [cardRef, shake] = useShake();
  const [resetPassword] = useResetPasswordMutation();
  const form = useForm<ResetInput, unknown, ResetOutput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: { tenantSlug: tenant ?? '', newPassword: '', confirmPassword: '' },
  });
  const { errors, isSubmitting, isSubmitSuccessful } = form.formState;
  const password = form.watch('newPassword');

  if (!token) {
    return (
      <AuthCard
        title={t.missingTokenTitle}
        subtitle={t.missingTokenDesc}
        icon={
          <span className="flex size-14 items-center justify-center rounded-lg bg-warning-tint text-warning">
            <LinkIcon className="size-7" aria-hidden />
          </span>
        }
      >
        <Link
          href={routes.forgotPassword}
          className={buttonVariants({ fullWidth: true, size: 'lg' })}
        >
          {t.requestNew}
        </Link>
      </AuthCard>
    );
  }

  const onValid = async ({ tenantSlug, newPassword }: ResetOutput) => {
    try {
      await resetPassword({ tenantSlug, token, newPassword }).unwrap();
      toast.success(t.success, t.successDesc);
      window.setTimeout(() => {
        router.replace(routes.login);
      }, REDIRECT_DELAY_MS);
    } catch (error) {
      const problem = toProblem(error);
      applyServerErrors(problem, form.setError, ['newPassword']);
      shake();
      toast.error(problem.title, problem.detail);
      throw error;
    }
  };

  return (
    <AuthCard ref={cardRef} title={t.title} subtitle={t.subtitle}>
      <form
        noValidate
        onSubmit={(event) => {
          form
            .handleSubmit(onValid, (formErrors) => {
              shake();
              toastInvalidForm(formErrors);
            })(event)
            .catch(() => undefined);
        }}
        className="flex flex-col gap-5"
      >
        <TenantSlugField
          registration={form.register('tenantSlug')}
          error={errors.tenantSlug?.message}
          onRestore={(slug) => {
            if (!form.getValues('tenantSlug')) form.setValue('tenantSlug', slug);
          }}
        />
        <FormField label={t.newPassword} error={errors.newPassword?.message} required>
          {(control) => (
            <PasswordInput
              {...control}
              {...form.register('newPassword')}
              autoComplete="new-password"
            />
          )}
        </FormField>

        <ul aria-label={t.rulesLabel} className="-mt-2 flex flex-wrap gap-2">
          {rules.map((rule) => {
            const ok = rule.test(password);
            return (
              <li
                key={rule.label}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-300',
                  ok ? 'bg-success-tint text-success' : 'bg-canvas text-muted',
                )}
              >
                <Check
                  className={cn('size-3.5 transition-opacity', ok ? 'opacity-100' : 'opacity-30')}
                  aria-hidden
                />
                {rule.label}
              </li>
            );
          })}
        </ul>

        <FormField label={t.confirmPassword} error={errors.confirmPassword?.message} required>
          {(control) => (
            <PasswordInput
              {...control}
              {...form.register('confirmPassword')}
              autoComplete="new-password"
            />
          )}
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting || isSubmitSuccessful}
          iconStart={<KeyRound aria-hidden />}
        >
          {t.submit}
        </Button>
      </form>
    </AuthCard>
  );
}
