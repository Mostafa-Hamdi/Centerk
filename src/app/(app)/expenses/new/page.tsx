import type { Metadata } from 'next';
import { ExpenseCreatePage } from '@/features/cash/components/ExpenseCreatePage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.expenses.form.title };

export default function Page() {
  return <ExpenseCreatePage />;
}
