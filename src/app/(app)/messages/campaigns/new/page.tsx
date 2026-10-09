import type { Metadata } from 'next';
import { CampaignFormPage } from '@/features/messages/components/CampaignFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.campaigns.form.addTitle };

export default function Page() {
  return <CampaignFormPage />;
}
