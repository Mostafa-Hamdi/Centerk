import type { Metadata } from 'next';
import { HallsPage } from '@/features/halls/components/HallsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.halls.title };

export default function Page() {
  return <HallsPage />;
}
