import type { Metadata } from 'next';
import { TemplateFormPage } from '@/features/messages/components/TemplateFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.templates.form.addTitle };

export default function Page() {
  return <TemplateFormPage />;
}
