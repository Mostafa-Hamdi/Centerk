import type { Metadata } from 'next';
import { ScheduledReportsPage } from '@/features/reports/components/ScheduledReportsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.reports.scheduled.title };

export default function Page() {
  return <ScheduledReportsPage />;
}
