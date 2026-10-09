import type { Metadata } from 'next';
import { CampaignFormPage } from '@/features/messages/components/CampaignFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.messages.campaigns.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignFormPage id={decodeURIComponent(id)} />;
}
