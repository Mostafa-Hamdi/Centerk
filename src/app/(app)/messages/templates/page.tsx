import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { TemplatesPage } from '@/features/messages/components/TemplatesPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.tabs.templates };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <TemplatesPage />
    </Suspense>
  );
}
