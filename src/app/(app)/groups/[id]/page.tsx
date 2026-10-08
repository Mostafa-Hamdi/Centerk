import type { Metadata } from 'next';
import { GroupDetailsPage } from '@/features/groups/components/GroupDetailsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.groups.title };

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupDetailsPage id={decodeURIComponent(id)} />;
}
