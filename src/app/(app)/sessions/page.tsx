import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { SchedulePage } from '@/features/sessions/components/SchedulePage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.sessions.title };

export default function SessionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem] w-full rounded-xl" />}>
      <SchedulePage />
    </Suspense>
  );
}
