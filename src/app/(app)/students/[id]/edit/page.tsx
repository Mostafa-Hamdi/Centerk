import type { Metadata } from 'next';
import { StudentEditPage } from '@/features/students/components/StudentEditPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.common.edit };

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentEditPage id={decodeURIComponent(id)} />;
}
