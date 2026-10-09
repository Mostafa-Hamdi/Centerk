import type { Metadata } from 'next';
import { MaterialDetailPage } from '@/features/materials/components/MaterialDetailPage';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.materials.title };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MaterialDetailPage id={decodeURIComponent(id)} />;
}
