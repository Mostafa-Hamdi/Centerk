import type { Metadata } from 'next';
import { GeneralSettingsPage } from '@/features/settings/components/GeneralSettingsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.settings.title };

export default function Page() {
  return <GeneralSettingsPage />;
}
