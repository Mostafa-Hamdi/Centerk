import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { StaffAttendancePage } from '@/features/staff/components/StaffAttendancePage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.staff.tabs.attendance };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <StaffAttendancePage />
    </Suspense>
  );
}
