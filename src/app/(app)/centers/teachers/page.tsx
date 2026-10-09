import type { Metadata } from 'next';
import { TeachersPage } from '@/features/centers/components/TeachersPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.teachers.title };

export default function Page() {
  return <TeachersPage />;
}
