import { z } from 'zod';
import { ar } from '@/i18n/ar';

const v = ar.validation;

const optionalId = z
  .string()
  .trim()
  .transform((value) => value || undefined);

/**
 * Group add/edit form — mirrors Swagger NewGroup / UpdateGroupRequest:
 * name ≤150 (required), subject ≤100, grade ≤60, capacity int ≥1, price ≥0, teacher (required), optional hall.
 */
export const groupFormSchema = z.object({
  name: z.string().trim().min(1, v.required).max(150, v.tooLong(150)),
  subject: z.string().trim().min(1, v.required).max(100, v.tooLong(100)),
  grade: z.string().trim().min(1, v.required).max(60, v.tooLong(60)),
  capacity: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(
      z
        .number({ error: v.wholeNumber })
        .int(v.wholeNumber)
        .min(1, v.minValue(1))
        .max(1000, v.maxValue(1000))
        .optional(),
    ),
  price: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(z.number({ error: v.number }).min(0, v.minValue(0)).max(100_000, v.maxValue(100_000))),
  hallId: optionalId,
  /** Required by the backend validator (POST /groups). */
  teacherId: z.string().trim().min(1, v.required),
});

export type GroupFormInput = z.input<typeof groupFormSchema>;
export type GroupFormValues = z.output<typeof groupFormSchema>;
