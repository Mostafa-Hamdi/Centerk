import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { PayrollPage } from '@/features/staff/components/PayrollPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.staff.tabs.payroll };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <PayrollPage />
    </Suspense>
  );
}
