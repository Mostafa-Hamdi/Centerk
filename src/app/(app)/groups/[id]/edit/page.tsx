import type { Metadata } from 'next';
import { GroupFormPage } from '@/features/groups/components/GroupFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.common.edit };

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupFormPage id={decodeURIComponent(id)} />;
}
