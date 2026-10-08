import type { Metadata } from 'next';
import { AttendanceIndexPage } from '@/features/attendance/components/AttendanceIndexPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.attendance.title };

export default function AttendancePage() {
  return <AttendanceIndexPage />;
}
