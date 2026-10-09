import type { Metadata } from 'next';
import { AuditEntryPage } from '@/features/audit/components/AuditEntryPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.audit.details.title };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuditEntryPage id={decodeURIComponent(id)} />;
}
