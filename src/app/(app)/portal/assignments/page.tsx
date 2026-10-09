import type { Metadata } from 'next';
import { PortalAssignmentsPage } from '@/features/portal/components/PortalAssignmentsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.portal.assignments.title };

export default function Page() {
  return <PortalAssignmentsPage />;
}
