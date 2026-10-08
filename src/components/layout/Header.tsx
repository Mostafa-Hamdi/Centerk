'use client';

import { Menu, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { useSidebar } from '@/hooks/useSidebar';
import { ar } from '@/i18n/ar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { commandPaletteToggled, mobileNavToggled, selectCommandPaletteOpen } from '@/store/uiSlice';
import { BranchSwitcher } from './BranchSwitcher';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationsMenu } from './NotificationsMenu';
import { ProfileMenu } from './ProfileMenu';

const CommandPalette = dynamic(() => import('./CommandPalette'), { ssr: false });

const iconButton =
  'flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-primary-tint hover:text-primary';

/** Floating glass header: menu toggle, title/breadcrumb, search (Ctrl/⌘+K), branch, bell, profile. */
export function Header() {
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { collapsed, toggle } = useSidebar();
  const paletteOpen = useAppSelector(selectCommandPaletteOpen);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        dispatch(commandPaletteToggled(true));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dispatch]);

  return (
    <header className="sticky top-(--shell-gap) z-30 flex h-(--header-h) items-center gap-2 rounded-lg border border-line glass px-2 shadow-card sm:gap-3 sm:px-3">
      <button
        type="button"
        className={iconButton}
        onClick={() => (isDesktop ? toggle() : dispatch(mobileNavToggled(true)))}
        aria-label={
          isDesktop ? (collapsed ? ar.shell.expand : ar.shell.collapse) : ar.shell.openMenu
        }
        aria-controls={isDesktop ? 'app-sidebar' : undefined}
        aria-expanded={isDesktop ? !collapsed : undefined}
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <button
        type="button"
        onClick={() => dispatch(commandPaletteToggled(true))}
        aria-label={ar.shell.searchLabel}
        aria-keyshortcuts="Control+K Meta+K"
        className="hidden min-h-11 w-64 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-primary md:flex"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-start">{ar.shell.search}</span>
        <kbd dir="ltr" className="rounded-sm border border-line px-1.5 text-xs">
          Ctrl K
        </kbd>
      </button>
      <button
        type="button"
        className={`${iconButton} md:hidden`}
        onClick={() => dispatch(commandPaletteToggled(true))}
        aria-label={ar.shell.searchLabel}
      >
        <Search className="size-5" aria-hidden />
      </button>

      <BranchSwitcher />
      <NotificationsMenu />
      <ProfileMenu />

      {paletteOpen ? <CommandPalette /> : null}
    </header>
  );
}
