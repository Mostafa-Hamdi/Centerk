import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.nav.centers };

export default function Page() {
  return <ComingSoon title={ar.nav.centers} />;
}
