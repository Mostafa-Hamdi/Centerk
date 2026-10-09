import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { CashDrawerPage } from '@/features/cash/components/CashDrawerPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.cash.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <CashDrawerPage />
    </Suspense>
  );
}
