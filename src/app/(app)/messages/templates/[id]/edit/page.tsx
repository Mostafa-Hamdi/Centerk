import type { Metadata } from 'next';
import { TemplateFormPage } from '@/features/messages/components/TemplateFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.templates.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TemplateFormPage id={decodeURIComponent(id)} />;
}
