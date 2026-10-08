'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ar } from '@/i18n/ar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { Sidebar } from './Sidebar';

/** "Floating" shell: sidebar card + glass header on the page background, 16px gutters. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Move focus to the content on client-side navigation so screen readers announce the new page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={200}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink"
      >
        {ar.shell.skipToContent}
      </a>
      <div className="flex min-h-dvh gap-(--shell-gap) p-(--shell-gap)">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-(--shell-gap)">
          <Header />
          <main id="main" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 outline-none">
            {children}
          </main>
        </div>
      </div>
      <MobileDrawer />
    </TooltipProvider>
  );
}
