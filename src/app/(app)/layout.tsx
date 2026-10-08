import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGate } from '@/features/auth/components/AuthGate';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/** Authenticated area: session gate + floating shell. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
