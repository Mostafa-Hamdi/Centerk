import type { Metadata } from 'next';
import { MaterialFormPage } from '@/features/materials/components/MaterialFormPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.materials.form.editTitle };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MaterialFormPage id={decodeURIComponent(id)} />;
}
