'use client';

import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { FormField } from '@/components/form/FormField';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { useCountdown } from '@/hooks/useCountdown';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { useRequestOtpMutation, useVerifyOtpMutation } from '../api';
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '../constants';
import { useCompleteLogin } from '../hooks/useCompleteLogin';
import { otpCodeSchema } from '../schemas';
import type { OtpRequest } from '../types';

const t = ar.auth.portal;

interface OtpStepProps {
  request: OtpRequest;
  /** From POST /auth/otp/request; replaced on resend. */
  challengeId: string | undefined;
  rememberMe: boolean;
  maskedDestination: string | null;
  resendAfterSeconds: number;
  onBack: () => void;
  onFailure: () => void;
}

/** Step 2 of the portal login: 6-digit code, auto-submit, resend countdown. */
export function OtpStep({
  request,
  challengeId: initialChallengeId,
  rememberMe,
  maskedDestination,
  resendAfterSeconds,
  onBack,
  onFailure,
}: OtpStepProps) {
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const [error, setError] = useState<string>();
  const [verifyOtp, verifyState] = useVerifyOtpMutation();
  const [requestOtp, resendState] = useRequestOtpMutation();
  const completeLogin = useCompleteLogin();
  const countdown = useCountdown(resendAfterSeconds);
  const [busy, setBusy] = useState(false);
  const descriptionId = useId();

  const verify = async (value: string) => {
    const parsed = otpCodeSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      onFailure();
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      const session = await verifyOtp({
        tenantSlug: request.tenantSlug,
        phone: request.phone,
        purpose: request.purpose,
        challengeId,
        code: parsed.data,
        rememberMe,
      }).unwrap();
      await completeLogin(session);
    } catch (caught) {
      const problem = toProblem(caught);
      setError(problem.title);
      setCode('');
      setBusy(false);
      onFailure();
      toast.error(problem.title, problem.detail);
    }
  };

  const resend = async () => {
    try {
      const result = await requestOtp(request).unwrap();
      if (result?.challengeId) setChallengeId(result.challengeId);
      countdown.restart(result?.resendAfterSeconds ?? OTP_RESEND_SECONDS);
      setCode('');
      setError(undefined);
      toast.info(t.codeResent);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void verify(code);
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-start gap-3 rounded-md bg-cyan-tint p-4 text-cyan-deep">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p id={descriptionId} className="text-sm">
          {maskedDestination ? t.otpSentTo(maskedDestination) : t.otpSentGeneric}
        </p>
      </div>

      <FormField label={t.otpTitle} error={error}>
        {(control) => (
          <OtpInput
            value={code}
            onChange={(value) => {
              setCode(value);
              if (error) setError(undefined);
            }}
            onComplete={(value) => {
              void verify(value);
            }}
            length={OTP_LENGTH}
            label={t.otpLabel}
            invalid={control['aria-invalid']}
            describedBy={[descriptionId, control['aria-describedby']].filter(Boolean).join(' ')}
            disabled={busy}
            autoFocus
          />
        )}
      </FormField>

      <Button type="submit" size="lg" fullWidth loading={busy || verifyState.isLoading}>
        {t.verify}
      </Button>

      <div className="flex items-center justify-between gap-2 text-sm">
        <Button variant="ghost" size="sm" onClick={onBack} iconStart={<ArrowRight aria-hidden />}>
          {t.change}
        </Button>
        {countdown.done ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => void resend()}
            loading={resendState.isLoading}
          >
            {t.resend}
          </Button>
        ) : (
          <span className="text-muted tabular" aria-live="polite">
            {t.resendIn(countdown.secondsLeft)}
          </span>
        )}
      </div>
    </form>
  );
}
