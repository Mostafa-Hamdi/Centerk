import type { Metadata } from 'next';
import { StudentCreatePage } from '@/features/students/components/StudentCreatePage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.students.addTitle };

export default function NewStudentPage() {
  return <StudentCreatePage />;
}
