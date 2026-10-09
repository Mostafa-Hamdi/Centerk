import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.nav.settings };

export default function Page() {
  return <ComingSoon title={ar.nav.settings} />;
}
