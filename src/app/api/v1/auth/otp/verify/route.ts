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

/** Swagger `OtpVerify` + rememberMe. */
const bodySchema = z.object({
  tenantSlug: z.string().min(1),
  challengeId: z.uuid().optional(),
  phone: z.string().min(1),
  purpose: z.enum(['guardian-login', 'student-login']),
  code: z.string().regex(/^\d{6}$/),
  rememberMe: z.boolean(),
});

/** BFF for POST /api/v1/auth/otp/verify (guardian / student login). */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return problem(403, 'forbidden', ar.errors.forbidden);
  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) return problem(400, 'validation', ar.errors.validation);

  const { rememberMe, ...payload } = parsed.data;
  const response = await callBackend('/auth/otp/verify', payload);
  if (!response) return unreachable();
  if (!response.ok) return relay(response);
  return sessionFromBackend(response, rememberMe, payload.tenantSlug);
}
