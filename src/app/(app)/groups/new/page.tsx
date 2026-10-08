import type { Metadata } from 'next';
import { GroupFormPage } from '@/features/groups/components/GroupFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.groups.addTitle };

export default function NewGroupPage() {
  return <GroupFormPage />;
}
