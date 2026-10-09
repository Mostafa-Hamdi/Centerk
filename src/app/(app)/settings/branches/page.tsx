import type { Metadata } from 'next';
import { BranchesSettingsPage } from '@/features/settings/components/BranchesSettingsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.settings.tabs.branches };

export default function Page() {
  return <BranchesSettingsPage />;
}
