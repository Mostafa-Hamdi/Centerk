'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { m } from 'framer-motion';
import { CornerDownLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { navigation } from '@/config/navigation';
import { hasPermission } from '@/features/auth/permissions';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { selectMe } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { commandPaletteToggled } from '@/store/uiSlice';

/** Strip tashkeel and unify alef/yaa/taa-marbuta forms so "اداره" finds "الإدارة". */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[ً-ْ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

/**
 * Ctrl/⌘+K palette (lazy-loaded). Searches navigation for now; record search plugs in when the
 * backend exposes it (docs/api-gaps.md #9).
 */
export default function CommandPalette() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const me = useAppSelector(selectMe);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    const allowed = navigation
      .flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))
      .filter((item) => !item.permissions || hasPermission(me, item.permissions, 'any'));
    const needle = normalize(query.trim());
    return needle
      ? allowed.filter((item) => normalize(`${item.label} ${item.group}`).includes(needle))
      : allowed;
  }, [me, query]);

  const close = () => dispatch(commandPaletteToggled(false));
  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + step + items.length) % Math.max(items.length, 1));
    } else if (event.key === 'Enter') {
      const item = items[activeIndex];
      if (item) go(item.href);
    }
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm" />
        <Dialog.Content asChild aria-describedby={undefined}>
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="fixed inset-x-4 top-[12vh] z-50 mx-auto max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-lift"
          >
            <Dialog.Title className="sr-only">{ar.shell.searchLabel}</Dialog.Title>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 text-muted" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={ar.shell.search}
                aria-label={ar.shell.searchLabel}
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-activedescendant={items[activeIndex] ? `cmd-${activeIndex}` : undefined}
                className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
              />
              <kbd className="rounded-sm border border-line px-1.5 py-0.5 text-xs text-muted">
                Esc
              </kbd>
            </div>
            <ul id="command-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
              {items.length ? (
                items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.href}
                      id={`cmd-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onPointerMove={() => setActiveIndex(index)}
                      onClick={() => go(item.href)}
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-sm',
                        index === activeIndex ? 'bg-primary-tint text-primary' : 'text-ink',
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs text-muted">{item.group}</span>
                      {index === activeIndex ? (
                        <CornerDownLeft className="size-4" aria-hidden />
                      ) : null}
                    </li>
                  );
                })
              ) : (
                <li className="p-6 text-center text-sm text-muted">{ar.shell.searchEmpty}</li>
              )}
            </ul>
            <p className="border-t border-line px-4 py-2 text-xs text-muted">
              {ar.shell.searchHint}
            </p>
          </m.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
