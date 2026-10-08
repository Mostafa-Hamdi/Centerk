'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { findNavItem } from '@/config/navigation';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

/** Page title + breadcrumb derived from the navigation config. */
export function Breadcrumbs() {
  const pathname = usePathname();
  const item = findNavItem(pathname);
  const title = item?.label ?? ar.nav.dashboard;
  const isRoot = !item || item.href === routes.dashboard;

  return (
    <div className="min-w-0">
      <p className="truncate font-display text-base font-semibold text-ink sm:text-lg">{title}</p>
      {isRoot ? null : (
        <nav aria-label={ar.shell.breadcrumb} className="hidden sm:block">
          <ol className="flex items-center gap-1 text-xs text-muted">
            <li>
              <Link href={routes.dashboard} className="hover:text-primary">
                {ar.nav.dashboard}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronLeft className="size-3.5" />
            </li>
            <li aria-current="page" className="truncate">
              {title}
            </li>
          </ol>
        </nav>
      )}
    </div>
  );
}
