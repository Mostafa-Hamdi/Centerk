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

/** Staff login. Existing passwords are only checked for presence — strength rules apply on reset. */
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, v.required).max(128),
  rememberMe: z.boolean(),
});

/** Portal step 1: guardian by phone, student by code — the other field is ignored. */
export const portalIdentifySchema = z
  .object({
    as: z.enum(['guardian', 'student']),
    phone: z.string(),
    studentCode: z.string(),
    rememberMe: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const [field, schema] =
      value.as === 'guardian'
        ? (['phone', phoneSchema] as const)
        : (['studentCode', studentCodeSchema] as const);
    const result = schema.safeParse(value[field]);
    if (!result.success) {
      ctx.addIssue({
        code: 'custom',
        path: [field],
        message: result.error.issues[0]?.message ?? v.required,
      });
    }
  })
  .transform((value) => ({
    rememberMe: value.rememberMe,
    identity:
      value.as === 'guardian'
        ? { phone: phoneSchema.parse(value.phone) }
        : { studentCode: studentCodeSchema.parse(value.studentCode) },
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
