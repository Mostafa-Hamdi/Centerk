import type { Metadata } from 'next';
import { Showcase } from './Showcase';

export const metadata: Metadata = { title: 'مكتبة المكونات' };

/** Living style guide for review (not linked from the sidebar). */
export default function ComponentsPage() {
  return <Showcase />;
}
