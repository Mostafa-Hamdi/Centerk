'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';

const tabs = [
  { href: routes.cashShifts.list, label: ar.cash.tabs.drawer },
  { href: routes.expenses.list, label: ar.cash.tabs.expenses },
] as const;

/** Drawer ↔ expenses switcher (one nav entry «الخزنة والمصروفات» covers both pages). */
export function CashTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label={ar.nav.cash} className="flex gap-1 rounded-md bg-canvas p-1 print:hidden">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-sm px-4 py-2 text-sm font-medium transition-colors',
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
