import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { CollectPaymentPage } from '@/features/payments/components/CollectPaymentPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.payments.collect };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <CollectPaymentPage />
    </Suspense>
  );
}
