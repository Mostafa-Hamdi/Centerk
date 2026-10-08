import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { StudentsListPage } from '@/features/students/components/StudentsListPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.students.title };

/** Suspense is required because the list state lives in the URL (useSearchParams). */
export default function StudentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem] w-full rounded-xl" />}>
      <StudentsListPage />
    </Suspense>
  );
}
