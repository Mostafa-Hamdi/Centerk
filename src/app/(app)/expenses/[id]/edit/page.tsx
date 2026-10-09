import type { Metadata } from 'next';
import { ExpenseFormPage } from '@/features/cash/components/ExpenseFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.expenses.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExpenseFormPage id={decodeURIComponent(id)} />;
}
