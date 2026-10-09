import type { Metadata } from 'next';
import { StaffRoleCard } from '@/features/account/components/StaffRoleCard';
import { StaffFormPage } from '@/features/staff/components/StaffFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.staff.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffId = decodeURIComponent(id);
  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <StaffFormPage id={staffId} />
      <StaffRoleCard userId={staffId} />
    </div>
  );
}
