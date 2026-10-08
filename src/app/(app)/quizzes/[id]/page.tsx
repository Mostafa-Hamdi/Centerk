import type { Metadata } from 'next';
import { QuizGradesPage } from '@/features/quizzes/components/QuizGradesPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.quizzes.title };

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizGradesPage id={decodeURIComponent(id)} />;
}
