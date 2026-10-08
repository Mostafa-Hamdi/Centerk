import type { MetadataRoute } from 'next';
import { brand } from '@/config/brand';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ar.app.name,
    short_name: ar.app.name,
    description: ar.app.description,
    lang: 'ar',
    dir: 'rtl',
    start_url: routes.dashboard,
    display: 'standalone',
    background_color: brand.themeColor,
    theme_color: brand.themeColor,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
