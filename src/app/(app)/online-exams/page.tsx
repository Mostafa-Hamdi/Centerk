import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { OnlineExamsPage } from '@/features/onlineExams/components/OnlineExamsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.onlineExams.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <OnlineExamsPage />
    </Suspense>
  );
}
