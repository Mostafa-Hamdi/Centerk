import type { MetadataRoute } from 'next';
import { routes } from '@/config/routes';
import { env } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  return [routes.login, routes.forgotPassword].map((path) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${path}`,
    changeFrequency: 'monthly',
    priority: path === routes.login ? 1 : 0.5,
  }));
}
