import type { Metadata } from 'next';
import { AutomationFormPage } from '@/features/messages/components/AutomationFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.automation.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AutomationFormPage id={decodeURIComponent(id)} />;
}
