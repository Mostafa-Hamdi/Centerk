import type { Metadata } from 'next';
import { QuestionFormPage } from '@/features/questions/components/QuestionFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.questions.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuestionFormPage id={decodeURIComponent(id)} />;
}
