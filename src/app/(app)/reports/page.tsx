import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReportsPage } from '@/features/reports/components/ReportsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.reports.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ReportsPage />
    </Suspense>
  );
}
