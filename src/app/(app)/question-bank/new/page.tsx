import type { Metadata } from 'next';
import { QuestionFormPage } from '@/features/questions/components/QuestionFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.questions.form.addTitle };

export default function Page() {
  return <QuestionFormPage />;
}
