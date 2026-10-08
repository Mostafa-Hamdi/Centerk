'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { m } from 'framer-motion';
import { ArrowRight, MessageCircle, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { FormField } from '@/components/form/FormField';
import { toast } from '@/components/feedback/toast';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { routes } from '@/config/routes';
import { useCountdown } from '@/hooks/useCountdown';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useForgotPasswordMutation } from '../api';
import { OTP_RESEND_SECONDS } from '../constants';
import { useShake } from '../hooks/useShake';
import { forgotPasswordSchema } from '../schemas';
import { AuthCard } from './AuthCard';
import { rememberTenantSlug, TenantSlugField } from './TenantSlugField';

type ForgotInput = z.input<typeof forgotPasswordSchema>;
type ForgotOutput = z.output<typeof forgotPasswordSchema>;

const t = ar.auth.forgot;

/** backend-spec §10.1: POST /auth/password/forgot sends a reset link via WhatsApp. */
export function ForgotPasswordForm() {
  const [cardRef, shake] = useShake();
  const [sentTo, setSentTo] = useState<ForgotOutput | null>(null);
  const [forgotPassword] = useForgotPasswordMutation();
  const countdown = useCountdown(0);
  const form = useForm<ForgotInput, unknown, ForgotOutput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { tenantSlug: '', phone: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const send = async ({ tenantSlug, phone }: ForgotOutput) => {
    try {
      await forgotPassword({ tenantSlug, phone }).unwrap();
      rememberTenantSlug(tenantSlug);
      setSentTo({ tenantSlug, phone });
      countdown.restart(OTP_RESEND_SECONDS);
    } catch (error) {
      const problem = toProblem(error);
      applyServerErrors(problem, form.setError, ['tenantSlug', 'phone']);
      shake();
      toast.error(problem.title, problem.detail);
    }
  };

  const backLink = (
    <Link href={routes.login} className={buttonVariants({ variant: 'neutral', fullWidth: true })}>
      <ArrowRight className="size-4" aria-hidden />
      {t.backToLogin}
    </Link>
  );

  if (sentTo) {
    return (
      <AuthCard
        title={t.sentTitle}
        subtitle={t.sentDesc}
        icon={
          <m.span
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16 }}
            className="flex size-14 items-center justify-center rounded-lg bg-success-tint text-success"
          >
            <MessageCircle className="size-7" aria-hidden />
          </m.span>
        }
      >
        <div className="flex flex-col gap-3">
          <Button
            variant="info"
            fullWidth
            disabled={!countdown.done}
            loading={isSubmitting}
            onClick={() => void send(sentTo)}
          >
            {countdown.done ? t.resend : ar.auth.portal.resendIn(countdown.secondsLeft)}
          </Button>
          {backLink}
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard ref={cardRef} title={t.title} subtitle={t.subtitle}>
      <form
        noValidate
        onSubmit={(event) => {
          void form.handleSubmit(send, (formErrors) => {
            shake();
            toastInvalidForm(formErrors);
          })(event);
        }}
        className="flex flex-col gap-5"
      >
        <TenantSlugField
          registration={form.register('tenantSlug')}
          error={errors.tenantSlug?.message}
          onRestore={(slug) => form.setValue('tenantSlug', slug)}
        />
        <FormField label={ar.auth.login.phone} error={errors.phone?.message} required>
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
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          iconStart={<MessageCircle aria-hidden />}
        >
          {t.submit}
        </Button>
        {backLink}
      </form>
    </AuthCard>
  );
}
