import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { OutboxPage } from '@/features/messages/components/OutboxPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.title };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <OutboxPage />
    </Suspense>
  );
}
