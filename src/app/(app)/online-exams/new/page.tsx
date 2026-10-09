import type { Metadata } from 'next';
import { OnlineExamFormPage } from '@/features/onlineExams/components/OnlineExamFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.onlineExams.form.addTitle };

export default function Page() {
  return <OnlineExamFormPage />;
}
