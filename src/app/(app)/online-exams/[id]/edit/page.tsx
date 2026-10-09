import type { Metadata } from 'next';
import { OnlineExamFormPage } from '@/features/onlineExams/components/OnlineExamFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.onlineExams.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OnlineExamFormPage id={decodeURIComponent(id)} />;
}
