import type { NextRequest } from 'next/server';
import { loginSchema } from '@/features/auth/schemas';
import { ar } from '@/i18n/ar';
import {
  callBackend,
  isSameOrigin,
  problem,
  readJson,
  relay,
  sessionFromBackend,
  unreachable,
} from '../_lib/bff';

/** BFF for POST /auth/login (staff: phone + password). */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return problem(403, 'forbidden', ar.errors.forbidden);
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return problem(400, 'validation', ar.errors.validation);

  const { rememberMe, ...credentials } = parsed.data;
  const response = await callBackend('/auth/login', credentials);
  if (!response) return unreachable();
  if (!response.ok) return relay(response);
  return sessionFromBackend(response, rememberMe);
}
