import type { Metadata } from 'next';
import { SettingsPage } from '@/features/settings/components/SettingsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.settings.title };

export default function Page() {
  return <SettingsPage />;
}
