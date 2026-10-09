import type { Metadata } from 'next';
import { StaffFormPage } from '@/features/staff/components/StaffFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.staff.form.addTitle };

export default function Page() {
  return <StaffFormPage />;
}
