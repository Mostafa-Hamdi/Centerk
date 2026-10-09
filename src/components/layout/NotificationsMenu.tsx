'use client';

import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, m } from 'framer-motion';
import { AlertTriangle, Bell, CheckCheck, ClipboardCheck, Info, Receipt } from 'lucide-react';
import { useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  type NotificationDto,
} from '@/features/notifications/api';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelative } from '@/lib/format';

const icons: Record<NotificationDto['type'], { icon: typeof Bell; chip: string }> = {
  Payment: { icon: Receipt, chip: 'bg-success-tint text-success' },
  Attendance: { icon: ClipboardCheck, chip: 'bg-primary-tint text-primary' },
  Alert: { icon: AlertTriangle, chip: 'bg-warning-tint text-warning' },
  System: { icon: Info, chip: 'bg-info-tint text-info' },
};

/** Bell with unread badge + animated panel and "mark all as read" (optimistic). */
export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const { data } = useGetNotificationsQuery(undefined, { pollingInterval: 60_000 });
  const [markAllRead, { isLoading }] = useMarkAllNotificationsReadMutation();
  const unread = data?.unreadCount ?? 0;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={
          unread ? `${ar.shell.notifications} · ${ar.shell.unread(unread)}` : ar.shell.notifications
        }
        className="relative flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-primary-tint hover:text-primary"
      >
        <Bell className="size-5" aria-hidden />
        {unread ? (
          <span className="absolute -end-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full border-2 border-surface bg-danger px-1 text-[11px] leading-4 font-bold text-primary-ink tabular">
            {formatNumber(unread)}
          </span>
        ) : null}
      </Popover.Trigger>
      <AnimatePresence>
        {open ? (
          <Popover.Portal forceMount>
            <Popover.Content asChild align="end" sideOffset={10} forceMount>
              <m.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-surface shadow-lift"
              >
                <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <div>
                    <p className="font-display font-semibold text-ink">{ar.shell.notifications}</p>
                    {unread ? (
                      <p className="text-xs text-muted">{ar.shell.unread(unread)}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={!unread || isLoading}
                    onClick={() => void markAllRead(undefined)}
                    className="flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-sm font-medium text-primary transition-colors hover:bg-primary-tint disabled:pointer-events-none disabled:opacity-40"
                  >
                    <CheckCheck className="size-4" aria-hidden />
                    {ar.shell.markAllRead}
                  </button>
                </div>
                <ul className="max-h-96 overflow-y-auto overscroll-contain p-2">
                  {data?.items.length ? (
                    data.items.map((item) => {
                      // Unknown types from the backend fall back to the generic style.
                      const { icon: Icon, chip } =
                        (icons as Partial<typeof icons>)[item.type] ?? icons.System;
                      return (
                        <li
                          key={item.id}
                          className="flex gap-3 rounded-md p-3 transition-colors hover:bg-primary-tint"
                        >
                          <span
                            className={cn(
                              'flex size-9 shrink-0 items-center justify-center rounded-sm',
                              chip,
                            )}
                          >
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                              {item.title}
                              {item.isRead ? null : (
                                <span className="size-2 rounded-full bg-primary" aria-hidden />
                              )}
                            </p>
                            <p className="mt-0.5 text-sm text-muted">{item.body}</p>
                            <p className="mt-1 text-xs text-muted">
                              {formatRelative(item.createdAt)}
                            </p>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="p-6 text-center text-sm text-muted">
                      {ar.shell.noNotifications}
                    </li>
                  )}
                </ul>
              </m.div>
            </Popover.Content>
          </Popover.Portal>
        ) : null}
      </AnimatePresence>
    </Popover.Root>
  );
}
