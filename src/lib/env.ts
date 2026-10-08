import { z } from 'zod';

/** Built-in mock backend (src/mocks), served by this app at /api/mock. */
export const MOCK_API_BASE = '/api/mock';

/** True when the configured API is the built-in mock (no real backend URL set = demo mode). */
export function isMockApiUrl(url: string | undefined): boolean {
  return !url || url === MOCK_API_BASE || url.replace(/\/$/, '').endsWith(MOCK_API_BASE);
}

// Vercel exposes the production domain to the build; fall back to it so deploys need no config.
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
const defaultAppUrl = vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000';

const envSchema = z.object({
  /**
   * Backend base URL including the version prefix, e.g. https://api.example.com/api/v1.
   * Unset → demo mode against the mock backend.
   */
  NEXT_PUBLIC_API_URL: z.union([z.url(), z.literal(MOCK_API_BASE)]).default(MOCK_API_BASE),
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
  if (!/^https?:\/\//.test(trimmed) || /\/api(\/|$)/.test(new URL(trimmed).pathname))
    return trimmed;
  return `${trimmed}/api/v1`;
}

export const env = {
  ...parsedEnv,
  NEXT_PUBLIC_API_URL: withApiVersion(parsedEnv.NEXT_PUBLIC_API_URL),
};

export const usesMockApi = isMockApiUrl(env.NEXT_PUBLIC_API_URL);
