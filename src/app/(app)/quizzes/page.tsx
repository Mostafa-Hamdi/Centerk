import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuizzesListPage } from '@/features/quizzes/components/QuizzesListPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.quizzes.title };

export default function QuizzesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <QuizzesListPage />
    </Suspense>
  );
}
