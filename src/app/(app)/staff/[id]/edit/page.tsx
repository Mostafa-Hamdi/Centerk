import type { Metadata } from 'next';
import { StaffFormPage } from '@/features/staff/components/StaffFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.staff.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StaffFormPage id={decodeURIComponent(id)} />;
}
