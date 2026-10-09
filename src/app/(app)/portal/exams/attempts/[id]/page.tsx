import type { Metadata } from 'next';
import { AttemptPage } from '@/features/portal/components/AttemptPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.portal.exams.title };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AttemptPage id={decodeURIComponent(id)} />;
}
