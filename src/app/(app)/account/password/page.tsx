import type { Metadata } from 'next';
import { ChangePasswordPage } from '@/features/account/components/ChangePasswordPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.account.password };

export default function Page() {
  return <ChangePasswordPage />;
}
