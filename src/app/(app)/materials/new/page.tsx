import type { Metadata } from 'next';
import { MaterialFormPage } from '@/features/materials/components/MaterialFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.materials.form.addTitle };

export default function Page() {
  return <MaterialFormPage />;
}
