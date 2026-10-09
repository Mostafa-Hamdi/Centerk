import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { GuardiansPage } from '@/features/guardians/components/GuardiansPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.guardians.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <GuardiansPage />
    </Suspense>
  );
}
