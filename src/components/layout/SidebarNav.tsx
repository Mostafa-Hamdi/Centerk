'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { navigation, portalNavigation, type NavChild, type NavItem } from '@/config/navigation';
import { routes } from '@/config/routes';
import { hasPermission } from '@/features/auth/permissions';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import type { MeDto } from '@/features/auth/types';
import { selectMe } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

function isActive(pathname: string, item: NavItem) {
  return item.href === routes.dashboard || item.href === routes.portal.home
    ? pathname === item.href
    : [item.href, ...(item.matches ?? [])].some(
        (href) => pathname === href || pathname.startsWith(`${href}/`),
      );
}

interface SidebarNavProps {
  /** Icon-only mode (desktop collapsed): labels hidden, tooltips on. */
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Permission-filtered navigation, shared by the desktop sidebar and the mobile drawer. */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const me = useAppSelector(selectMe);
  const groups = useMemo(
    () =>
      (me && me.kind !== 'Staff' ? portalNavigation : navigation)
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !item.permissions || hasPermission(me, item.permissions, 'any'),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [me],
  );

  return (
    <nav aria-label={ar.nav.label} className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p
            className={cn(
              'px-3 pb-1 text-xs font-semibold tracking-wide text-muted transition-opacity duration-200',
              collapsed && 'sr-only',
            )}
          >
            {group.label}
          </p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <NavRow
                key={item.href}
                item={item}
                me={me}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Most specific child whose href matches the current path (so "/students/new" beats "/students"). */
function activeChild(pathname: string, children: readonly NavChild[]): string | undefined {
  return children
    .filter((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

interface NavRowProps {
  item: NavItem;
  me: MeDto | null;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}

/** One module: main link + (when expanded) a dropdown of its add / related pages. */
function NavRow({ item, me, pathname, collapsed, onNavigate }: NavRowProps) {
  const active = isActive(pathname, item);
  const Icon = item.icon;
  const children = (item.children ?? []).filter(
    (child) => !child.permissions || hasPermission(me, child.permissions, 'any'),
  );
  // Follows the active module until the user toggles it.
  const [open, setOpen] = useState<boolean | null>(null);
  const hasMenu = children.length > 1 && !collapsed;
  const expanded = hasMenu && (open ?? active);
  const current = expanded ? activeChild(pathname, children) : undefined;
  const menuId = `nav-${item.href.replace(/W+/g, '-')}`;

  return (
    <li>
      <div className="relative flex items-center">
        <Tooltip content={item.label} disabled={!collapsed}>
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group/nav relative flex min-h-11 flex-1 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200 ease-brand',
              active
                ? 'bg-primary-tint text-primary'
                : 'text-muted hover:-translate-x-0.5 hover:bg-primary-tint hover:text-ink',
              collapsed && 'justify-center px-0',
              hasMenu && 'pe-10',
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute inset-y-2 -start-3 w-1 rounded-full bg-primary"
              />
            ) : null}
            <Icon
              className="size-5 shrink-0 transition-transform duration-200 group-hover/nav:scale-110"
              aria-hidden
            />
            <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
          </Link>
        </Tooltip>
        {hasMenu ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={menuId}
            aria-label={ar.nav.expand(item.label)}
            onClick={() => setOpen(!expanded)}
            className="absolute end-1 flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-primary"
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-300 ease-brand',
                expanded && 'rotate-180',
              )}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      {hasMenu ? (
        <div
          id={menuId}
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-300 ease-brand',
            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <ul className="ms-6 flex flex-col gap-0.5 overflow-hidden border-s border-line ps-3">
            {children.map((child) => (
              <li key={child.href} className="first:mt-1 last:mb-1">
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  tabIndex={expanded ? undefined : -1}
                  aria-current={current === child.href ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-9 items-center rounded-md px-3 text-sm transition-all duration-200 ease-brand',
                    current === child.href
                      ? 'bg-primary-tint font-semibold text-primary before:absolute before:-start-[15px] before:size-2 before:rounded-full before:bg-primary'
                      : 'text-muted hover:-translate-x-0.5 hover:text-ink',
                  )}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
