import type { Metadata } from 'next';
import { AttendanceSessionPage } from '@/features/attendance/components/AttendanceSessionPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.attendance.title };

export default async function AttendanceSessionRoute({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <AttendanceSessionPage sessionId={decodeURIComponent(sessionId)} />;
}
