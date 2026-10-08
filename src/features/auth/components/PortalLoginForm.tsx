'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, m } from 'framer-motion';
import { IdCard, Send, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { FormField } from '@/components/form/FormField';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useRequestOtpMutation } from '../api';
import { OTP_RESEND_SECONDS } from '../constants';
import { portalIdentifySchema } from '../schemas';
import type { OtpRequest } from '../types';
import { OtpStep } from './OtpStep';

type IdentifyInput = z.input<typeof portalIdentifySchema>;
type IdentifyOutput = z.output<typeof portalIdentifySchema>;

interface OtpContext {
  request: OtpRequest;
  rememberMe: boolean;
  maskedDestination: string | null;
  resendAfterSeconds: number;
}

const t = ar.auth.portal;
const roles = [
  { value: 'guardian', label: t.asGuardian },
  { value: 'student', label: t.asStudent },
] as const;

/**
 * "ولي أمر / طالب" (backend-spec §6.1): guardian = phone + OTP, student = student code + OTP.
 * Step 1 requests the code (POST /auth/otp/request), step 2 verifies it through the BFF.
 */
export function PortalLoginForm({ onFailure }: { onFailure: () => void }) {
  const [otp, setOtp] = useState<OtpContext | null>(null);
  const [requestOtp] = useRequestOtpMutation();
  const form = useForm<IdentifyInput, unknown, IdentifyOutput>({
    resolver: zodResolver(portalIdentifySchema),
    mode: 'onBlur',
    defaultValues: { as: 'guardian', phone: '', studentCode: '', rememberMe: true },
  });
  const { errors, isSubmitting } = form.formState;
  const as = form.watch('as');

  const onValid = async ({ identity, rememberMe }: IdentifyOutput) => {
    const request: OtpRequest = { ...identity, purpose: 'Login' };
    try {
      const result = await requestOtp(request).unwrap();
      setOtp({
        request,
        rememberMe,
        maskedDestination: result?.maskedDestination ?? null,
        resendAfterSeconds: result?.resendAfterSeconds ?? OTP_RESEND_SECONDS,
      });
    } catch (error) {
      const problem = toProblem(error);
      applyServerErrors(problem, form.setError, ['phone', 'studentCode']);
      onFailure();
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {otp ? (
        <m.div
          key="otp"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
        >
          <OtpStep
            {...otp}
            onBack={() => {
              setOtp(null);
            }}
            onFailure={onFailure}
          />
        </m.div>
      ) : (
        <m.form
          key="identify"
          noValidate
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          onSubmit={(event) => {
            void form.handleSubmit(onValid, (formErrors) => {
              onFailure();
              toastInvalidForm(formErrors);
            })(event);
          }}
          className="flex flex-col gap-5"
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-ink">{t.as}</legend>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-line bg-surface text-sm font-medium text-muted transition-colors duration-200',
                    'hover:border-primary-soft has-checked:border-primary has-checked:bg-primary-tint has-checked:text-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
                  )}
                >
                  <input
                    type="radio"
                    value={role.value}
                    {...form.register('as')}
                    className="sr-only"
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>

          {as === 'guardian' ? (
            <FormField key="phone" label={t.guardianPhone} error={errors.phone?.message} required>
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
          ) : (
            <FormField
              key="code"
              label={t.studentCode}
              hint={t.studentCodeHint}
              error={errors.studentCode?.message}
              required
            >
              {(control) => (
                <Input
                  {...control}
                  {...form.register('studentCode')}
                  autoComplete="username"
                  autoCapitalize="characters"
                  dir="ltr"
                  placeholder="F-1024"
                  startAdornment={<IdCard aria-hidden />}
                />
              )}
            </FormField>
          )}

          <Controller
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label={ar.auth.login.rememberMe}
              />
            )}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            iconStart={<Send aria-hidden />}
          >
            {t.sendCode}
          </Button>
        </m.form>
      )}
    </AnimatePresence>
  );
}
