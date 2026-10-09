import type { Metadata } from 'next';
import { ReceiptPage } from '@/features/payments/components/ReceiptPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.payments.title };

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReceiptPage id={decodeURIComponent(id)} />;
}
