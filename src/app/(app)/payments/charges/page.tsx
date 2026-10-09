import type { Metadata } from 'next';
import { ChargesPage } from '@/features/finance/components/ChargesPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.charges.title };

export default function Page() {
  return <ChargesPage />;
}
