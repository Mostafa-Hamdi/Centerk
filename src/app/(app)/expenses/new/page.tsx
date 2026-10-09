import type { Metadata } from 'next';
import { ExpenseFormPage } from '@/features/cash/components/ExpenseFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.expenses.form.title };

export default function Page() {
  return <ExpenseFormPage />;
}
