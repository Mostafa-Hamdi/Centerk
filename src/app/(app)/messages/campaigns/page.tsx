import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { CampaignsPage } from '@/features/messages/components/CampaignsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.tabs.campaigns };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <CampaignsPage />
    </Suspense>
  );
}
