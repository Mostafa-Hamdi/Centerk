import { z } from 'zod';
import { ar } from '@/i18n/ar';
import { OTP_LENGTH } from './constants';

const v = ar.validation;

/** Arabic-Indic (٠-٩) and Persian (۰-۹) digits → ASCII. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export const EGYPT_MOBILE = /^01[0125][0-9]{8}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, v.required)
  .transform((value) => normalizeDigits(value).replace(/[\s-]/g, ''))
  .pipe(z.string().regex(EGYPT_MOBILE, v.phone));

export const newPasswordSchema = z
  .string()
  .min(8, v.passwordMin)
  .regex(/\p{L}/u, v.passwordLetter)
  .regex(/\d/, v.passwordDigit);

export const studentCodeSchema = z
  .string()
  .trim()
  .min(1, v.required)
  .transform((value) => normalizeDigits(value).toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9-]{2,20}$/, v.studentCode));

export const otpCodeSchema = z
  .string()
  .transform(normalizeDigits)
  .pipe(z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), v.otp));

/** Center code (`tenantSlug`) — required by every /auth endpoint of the live API. */
export const tenantSlugSchema = z
  .string()
  .trim()
  .min(1, v.required)
  .transform((value) => value.toLowerCase())
  .pipe(z.string().regex(/^[a-z0-9][a-z0-9_-]{1,63}$/, v.tenantSlug));

/** Staff login. Existing passwords are only checked for presence — strength rules apply on reset. */
export const loginSchema = z.object({
  tenantSlug: tenantSlugSchema,
  phone: phoneSchema,
  password: z.string().min(1, v.required).max(128),
  rememberMe: z.boolean(),
});

/**
 * Portal step 1 (Swagger `OtpRequest`): phone is required for both; students also give their code.
 * Conditional field validated with superRefine.
 */
export const portalIdentifySchema = z
  .object({
    as: z.enum(['guardian', 'student']),
    tenantSlug: tenantSlugSchema,
    phone: phoneSchema,
    studentCode: z.string(),
    rememberMe: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.as !== 'student') return;
    const result = studentCodeSchema.safeParse(value.studentCode);
    if (!result.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['studentCode'],
        message: result.error.issues[0]?.message ?? v.required,
      });
    }
  })
  .transform((value) => ({
    rememberMe: value.rememberMe,
    request: {
      tenantSlug: value.tenantSlug,
      phone: value.phone,
      purpose: value.as === 'guardian' ? ('guardian-login' as const) : ('student-login' as const),
      ...(value.as === 'student'
        ? { studentCode: studentCodeSchema.parse(value.studentCode) }
        : {}),
    },
  }));

export const forgotPasswordSchema = z.object({ phone: phoneSchema });

export const resetPasswordSchema = z
  .object({
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, v.required),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: v.passwordMismatch,
  });
