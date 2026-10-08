import type { Metadata } from 'next';
import { routes } from '@/config/routes';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { ar } from '@/i18n/ar';

const t = ar.auth.forgot;

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  alternates: { canonical: routes.forgotPassword },
  openGraph: {
    title: `${t.metaTitle} | ${ar.app.name}`,
    description: t.metaDescription,
    url: routes.forgotPassword,
  },
  twitter: { title: `${t.metaTitle} | ${ar.app.name}`, description: t.metaDescription },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
