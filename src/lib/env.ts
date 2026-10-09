import { z } from 'zod';

/** Default backend (TeacherCenters API). Override with NEXT_PUBLIC_API_URL when the domain changes. */
export const DEFAULT_API_URL = 'https://teachercenter.runasp.net/api/v1';

// Vercel exposes the production domain to the build; fall back to it so deploys need no config.
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
const defaultAppUrl = vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000';

const envSchema = z.object({
  /** Backend base URL, e.g. https://api.example.com/api/v1 (a bare domain gets /api/v1 appended). */
  NEXT_PUBLIC_API_URL: z.url().default(DEFAULT_API_URL),
  NEXT_PUBLIC_APP_URL: z.url().default(defaultAppUrl),
});

/**
 * Validated public env. NEXT_PUBLIC_* must be read with literal property access
 * so Next.js can inline them into the client bundle. Empty strings count as unset.
 */
const parsedEnv = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});

/**
 * The live API lives under /api/v1. Accept a bare domain ("https://teachercenter.runasp.net")
 * and append the prefix, so a missing "/api/v1" in the config can't break every call.
 */
export function withApiVersion(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  if (!/^https?:\/\//.test(trimmed) || /\/api(\/|$)/.test(new URL(trimmed).pathname)) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
}

export const env = {
  ...parsedEnv,
  NEXT_PUBLIC_API_URL: withApiVersion(parsedEnv.NEXT_PUBLIC_API_URL),
};
