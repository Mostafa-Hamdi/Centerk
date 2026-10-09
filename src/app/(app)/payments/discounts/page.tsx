import type { Metadata } from 'next';
import { DiscountsPage } from '@/features/extras/components/DiscountsPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.discounts.title };

export default function Page() {
  return <DiscountsPage />;
}
