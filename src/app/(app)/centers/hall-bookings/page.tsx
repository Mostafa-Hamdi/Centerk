import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { HallBookingsPage } from '@/features/centers/components/HallBookingsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.hallBookings.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <HallBookingsPage />
    </Suspense>
  );
}
