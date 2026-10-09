'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export interface SectionTab {
  href: string;
  label: string;
  /** Active only on this exact path (for a parent route like /messages). */
  exact?: boolean;
}

/** Link tabs between sibling pages of one module (one sidebar entry covers them all). */
export function SectionTabs({ tabs, label }: { tabs: readonly SectionTab[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={label}
      className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-canvas p-1 print:hidden"
    >
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-sm px-4 py-2 text-sm font-medium transition-colors',
              active ? 'bg-surface text-primary shadow-card' : 'text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
