import type { Metadata } from 'next';
import { ar } from '@/i18n/ar';
import { SessionSummary } from './SessionSummary';

export const metadata: Metadata = { title: ar.dashboard.title };

/** Placeholder inside the shell; replaced by the real dashboard in Phase 3. */
export default function DashboardPage() {
  return <SessionSummary />;
}
