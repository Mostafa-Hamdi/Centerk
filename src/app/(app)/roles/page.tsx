import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { RolesPage } from '@/features/roles/components/RolesPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.roles.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <RolesPage />
    </Suspense>
  );
}
