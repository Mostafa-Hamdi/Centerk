import type { Metadata } from 'next';
import { AutomationFormPage } from '@/features/messages/components/AutomationFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.automation.form.addTitle };

export default function Page() {
  return <AutomationFormPage />;
}
