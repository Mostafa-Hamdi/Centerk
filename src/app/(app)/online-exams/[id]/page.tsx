import type { Metadata } from 'next';
import { OnlineExamDetailPage } from '@/features/onlineExams/components/OnlineExamDetailPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.onlineExams.title };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OnlineExamDetailPage id={decodeURIComponent(id)} />;
}
