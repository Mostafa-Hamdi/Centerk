import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { AutomationPage } from '@/features/messages/components/AutomationPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.tabs.automation };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AutomationPage />
    </Suspense>
  );
}
