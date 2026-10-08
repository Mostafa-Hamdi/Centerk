import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { z } from 'zod';
import { ar } from '@/i18n/ar';

/** Normalized API error (RFC 9457 ProblemDetails, backend-spec §18). */
export interface Problem {
  status: number | null;
  code: string | null;
  /** Arabic, ready to show. */
  title: string;
  detail?: string;
  /** camelCase field path → messages, ready for react-hook-form `setError`. */
  fieldErrors: Record<string, string[]>;
  data?: unknown;
}

const problemSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  detail: z.string().optional(),
  status: z.number().optional(),
  code: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
  data: z.unknown().optional(),
});

const ARABIC = /[؀-ۿ]/;

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error !== null && 'status' in error;

function statusMessage(status: number | null): string {
  if (status === null) return ar.errors.network;
  if (status === 400 || status === 422) return ar.errors.validation;
  if (status === 401) return ar.errors.unauthorized;
  if (status === 402) return ar.errors.codes['plan-required'] ?? ar.errors.forbidden;
  if (status === 403) return ar.errors.forbidden;
  if (status === 404) return ar.errors.notFound;
  if (status === 412) return ar.errors.codes['concurrency-conflict'] ?? ar.errors.unknown;
  if (status === 429) return ar.errors.rateLimited;
  if (status === 502 || status === 503 || status === 504) return ar.errors.badGateway;
  if (status >= 500) return ar.errors.server;
  return ar.errors.unknown;
}

/** "Guardian.Phone" / "$.guardian.phone" → "guardian.phone" */
function toFieldPath(key: string): string {
  return key
    .replace(/^\$\./, '')
    .split('.')
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
    .join('.');
}

/** Turns any RTK Query / thrown error into a `Problem` with an Arabic title. */
export function toProblem(error: unknown): Problem {
  if (!isFetchBaseQueryError(error)) {
    return { status: null, code: null, title: ar.errors.unknown, fieldErrors: {} };
  }
  if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
    return { status: null, code: 'network', title: ar.errors.network, fieldErrors: {} };
  }

  const status =
    typeof error.status === 'number'
      ? error.status
      : error.status === 'PARSING_ERROR'
        ? error.originalStatus
        : null;
  const parsed = problemSchema.safeParse(error.data);
  const body = parsed.success ? parsed.data : {};
  const code = body.code ?? body.type?.split('/').pop() ?? null;
  const known = code ? ar.errors.codes[code] : undefined;
  const serverTitle = body.title && ARABIC.test(body.title) ? body.title : undefined;

  const fieldErrors: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(body.errors ?? {})) {
    fieldErrors[toFieldPath(key)] = messages;
  }

  return {
    status,
    code,
    title: known ?? serverTitle ?? statusMessage(status),
    detail: body.detail,
    fieldErrors,
    data: body.data,
  };
}
