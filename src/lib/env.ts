import { z } from 'zod';

const envSchema = z.object({
  /** Backend base URL including the version prefix, e.g. https://api.example.com/api/v1 */
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
});

/**
 * Validated public env. NEXT_PUBLIC_* must be read with literal property access
 * so Next.js can inline them into the client bundle.
 */
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
