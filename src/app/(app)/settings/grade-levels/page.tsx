import type { Metadata } from 'next';
import { AcademicSettingsPage } from '@/features/settings/components/AcademicSettingsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.settings.tabs.academic };

export default function Page() {
  return <AcademicSettingsPage />;
}
