import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { DuesPage } from '@/features/payments/components/DuesPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.payments.duesPage.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <DuesPage />
    </Suspense>
  );
}
