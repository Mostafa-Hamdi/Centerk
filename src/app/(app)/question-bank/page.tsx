import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuestionBankPage } from '@/features/questions/components/QuestionBankPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.questions.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <QuestionBankPage />
    </Suspense>
  );
}
