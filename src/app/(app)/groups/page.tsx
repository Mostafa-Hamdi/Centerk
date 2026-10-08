import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { GroupsListPage } from '@/features/groups/components/GroupsListPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.groups.title };

export default function GroupsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem] w-full rounded-xl" />}>
      <GroupsListPage />
    </Suspense>
  );
}
