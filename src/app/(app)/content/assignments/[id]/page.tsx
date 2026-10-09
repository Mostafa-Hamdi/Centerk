import type { Metadata } from 'next';
import { AssignmentDetailPage } from '@/features/content/components/AssignmentDetailPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.content.assignments.submissions };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssignmentDetailPage id={decodeURIComponent(id)} />;
}
