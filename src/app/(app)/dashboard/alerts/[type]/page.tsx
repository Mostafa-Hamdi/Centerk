import type { Metadata } from 'next';
import { AlertStudentsPage } from '@/features/extras/components/AlertStudentsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.dashboard.alertsTitle };

export default async function Page({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <AlertStudentsPage type={decodeURIComponent(type)} />;
}
