'use client';

import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Tooltip } from '@/components/ui/Tooltip';
import { routes } from '@/config/routes';
import { useSidebar } from '@/hooks/useSidebar';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { SidebarNav } from './SidebarNav';

/**
 * Floating desktop sidebar (≥1024px). Width comes from <html data-sidebar> via CSS so the
 * first paint is already correct; the logo is pinned and only the nav scrolls.
 */
export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const ToggleIcon = collapsed ? PanelRightOpen : PanelRightClose;

  return (
    <aside
      id="app-sidebar"
      className={cn(
        'sticky top-(--shell-gap) hidden h-[calc(100dvh-2*var(--shell-gap))] w-(--side-open) shrink-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card lg:flex',
        'transition-[width] duration-300 ease-brand in-data-[sidebar=collapsed]:w-(--side-closed)',
      )}
    >
      <div className="flex h-(--header-h) shrink-0 items-center border-b border-line px-5 in-data-[sidebar=collapsed]:justify-center in-data-[sidebar=collapsed]:px-0">
        <Link href={routes.dashboard} aria-label={ar.app.name} className="rounded-md">
          <Logo showWordmark={!collapsed} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="shrink-0 border-t border-line p-3">
        <Tooltip content={ar.shell.expand} disabled={!collapsed}>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            className={cn(
              'flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-primary-tint hover:text-ink',
              collapsed && 'justify-center px-0',
            )}
          >
            <ToggleIcon className="size-5 shrink-0" aria-hidden />
            <span className={cn(collapsed && 'sr-only')}>
              {collapsed ? ar.shell.expand : ar.shell.collapse}
            </span>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
