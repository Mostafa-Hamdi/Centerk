import type { ReactNode } from 'react';
import { BrandPanel } from '@/features/auth/components/BrandPanel';

/** Split auth layout: brand panel (lg+) beside the form column, floating on the page background. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh gap-(--shell-gap) p-(--shell-gap) lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <BrandPanel />
      <main id="main" className="flex items-center justify-center py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
