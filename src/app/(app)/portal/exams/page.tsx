import type { Metadata } from 'next';
import { PortalExamsPage } from '@/features/portal/components/PortalExamsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.portal.exams.title };

export default function Page() {
  return <PortalExamsPage />;
}
