import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { AssignmentsPage } from '@/features/content/components/AssignmentsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.content.tabs.assignments };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AssignmentsPage />
    </Suspense>
  );
}
