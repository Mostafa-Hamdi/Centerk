import type { Metadata } from 'next';
import { RoleFormPage } from '@/features/roles/components/RoleFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.roles.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoleFormPage id={decodeURIComponent(id)} />;
}
