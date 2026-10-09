import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { PaymentsListPage } from '@/features/payments/components/PaymentsListPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.payments.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <PaymentsListPage />
    </Suspense>
  );
}
