import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuizCreatePage } from '@/features/quizzes/components/QuizCreatePage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.quizzes.addTitle };

export default function NewQuizPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <QuizCreatePage />
    </Suspense>
  );
}
