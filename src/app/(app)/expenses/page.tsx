import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ExpensesPage } from '@/features/cash/components/ExpensesPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.expenses.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ExpensesPage />
    </Suspense>
  );
}
