import type { Metadata } from 'next';
import { RoleFormPage } from '@/features/roles/components/RoleFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.roles.form.addTitle };

export default function Page() {
  return <RoleFormPage />;
}
