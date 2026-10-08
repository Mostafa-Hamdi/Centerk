import type { MetadataRoute } from 'next';
import { routes } from '@/config/routes';
import { env } from '@/lib/env';

/** Only the public auth pages are crawlable; the app itself is private. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: [routes.login, routes.forgotPassword], disallow: '/' },
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
