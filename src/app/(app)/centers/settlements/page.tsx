import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { SettlementsPage } from '@/features/centers/components/SettlementsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.settlements.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <SettlementsPage />
    </Suspense>
  );
}
