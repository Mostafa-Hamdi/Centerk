import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = {
  title: ar.auth.reset.metaTitle,
  // Token-bearing URLs must never be indexed.
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token, tenant } = await searchParams;
  return (
    <ResetPasswordForm
      token={typeof token === 'string' && token ? token : null}
      tenant={typeof tenant === 'string' ? tenant : null}
    />
  );
}
