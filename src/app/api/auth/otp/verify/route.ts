import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ar } from '@/i18n/ar';
import {
  callBackend,
  isSameOrigin,
  problem,
  readJson,
  relay,
  sessionFromBackend,
  unreachable,
} from '../../_lib/bff';

const bodySchema = z
  .object({
    phone: z.string().optional(),
    studentCode: z.string().optional(),
    code: z.string().regex(/^\d{6}$/),
    purpose: z.literal('Login'),
    rememberMe: z.boolean(),
  })
  .refine((body) => Boolean(body.phone) !== Boolean(body.studentCode));

/** BFF for POST /auth/otp/verify (guardian by phone / student by code). */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return problem(403, 'forbidden', ar.errors.forbidden);
  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) return problem(400, 'validation', ar.errors.validation);

  const { rememberMe, ...payload } = parsed.data;
  const response = await callBackend('/auth/otp/verify', payload);
  if (!response) return unreachable();
  if (!response.ok) return relay(response);
  return sessionFromBackend(response, rememberMe);
}
