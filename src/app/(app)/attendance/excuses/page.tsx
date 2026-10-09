import type { Metadata } from 'next';
import { ExcusesPage } from '@/features/students/components/ExcusesPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.excuses.title };

export default function Page() {
  return <ExcusesPage />;
}
