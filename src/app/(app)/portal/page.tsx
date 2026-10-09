import type { Metadata } from 'next';
import { PortalHomePage } from '@/features/portal/components/PortalHomePage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.portal.title };

export default function Page() {
  return <PortalHomePage />;
}
