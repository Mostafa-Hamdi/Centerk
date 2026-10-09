'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { navigation, portalNavigation, type NavItem } from '@/config/navigation';
import { routes } from '@/config/routes';
import { hasPermission } from '@/features/auth/permissions';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
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
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Tooltip content={item.label} disabled={!collapsed}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group/nav relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200 ease-brand',
                        active
                          ? 'bg-primary-tint text-primary'
                          : 'text-muted hover:-translate-x-0.5 hover:bg-primary-tint hover:text-ink',
                        collapsed && 'justify-center px-0',
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
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
