import type { Metadata } from 'next';
import { StudentImportPage } from '@/features/students/components/StudentImportPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.studentImport.title };

export default function Page() {
  return <StudentImportPage />;
}
