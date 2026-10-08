import type { Metadata } from 'next';
import { routes } from '@/config/routes';
import { LoginCard } from '@/features/auth/components/LoginCard';
import { ar } from '@/i18n/ar';

const t = ar.auth.login;

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  alternates: { canonical: routes.login },
  openGraph: {
    title: `${t.metaTitle} | ${ar.app.name}`,
    description: t.metaDescription,
    url: routes.login,
  },
  twitter: { title: `${t.metaTitle} | ${ar.app.name}`, description: t.metaDescription },
};

export default function LoginPage() {
  return <LoginCard />;
}
