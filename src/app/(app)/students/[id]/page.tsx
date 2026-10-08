import type { Metadata } from 'next';
import { StudentDetailsPage } from '@/features/students/components/StudentDetailsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.students.title };

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDetailsPage id={decodeURIComponent(id)} />;
}
