import { z } from 'zod';
import { phoneSchema } from '@/features/auth/schemas';
import { ar } from '@/i18n/ar';

const v = ar.validation;

export const GUARDIAN_RELATIONS = [
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Uncle',
  'Other',
] as const;

/** Full name: at least 3 words (Egyptian triple name), ≤150 chars (Swagger maxLength). */
export const fullNameSchema = z
  .string()
  .trim()
  .min(1, v.required)
  .max(150, v.tooLong(150))
  .refine((value) => value.split(/\s+/).filter(Boolean).length >= 3, v.fullName);

const optionalPhone = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(phoneSchema.optional());

/**
 * Student add/edit form — mirrors Swagger `NewStudent` / `EditStudent`:
 * fullName ≤150, phone ≤30, grade ≤60, guardian {fullName, phone, relation ≤40} required on create,
 * guardianConsent required (Law 151/2020, backend-spec §19). Guardian phone ≠ student phone.
 */
export const studentFormSchema = z
  .object({
    fullName: fullNameSchema,
    phone: optionalPhone,
    grade: z.string().trim().min(1, v.required).max(60, v.tooLong(60)),
    guardian: z.object({
      fullName: z.string().trim().min(1, v.required).max(150, v.tooLong(150)),
      phone: phoneSchema,
      relation: z.enum(GUARDIAN_RELATIONS, { error: v.required }),
    }),
    guardianConsent: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.guardianConsent) {
      ctx.addIssue({ code: 'custom', path: ['guardianConsent'], message: v.consent });
    }
    if (value.phone && value.phone === value.guardian.phone) {
      ctx.addIssue({ code: 'custom', path: ['guardian', 'phone'], message: v.samePhone });
    }
  });

export type StudentFormInput = z.input<typeof studentFormSchema>;
export type StudentFormValues = z.output<typeof studentFormSchema>;

/** Edit only touches the student's own fields (Swagger `EditStudent`). */
export const studentEditSchema = z.object({
  fullName: fullNameSchema,
  phone: optionalPhone,
  grade: z.string().trim().min(1, v.required).max(60, v.tooLong(60)),
});

export type StudentEditInput = z.input<typeof studentEditSchema>;
export type StudentEditValues = z.output<typeof studentEditSchema>;
