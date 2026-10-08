import type { Metadata } from 'next';
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.dashboard.title };

export default function DashboardPage() {
  return <DashboardView />;
}
