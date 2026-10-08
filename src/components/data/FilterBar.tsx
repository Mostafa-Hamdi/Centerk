'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { ar } from '@/i18n/ar';
import { formatNumber } from '@/lib/format';

export interface ActiveFilter {
  key: string;
  /** e.g. "المجموعة: كيمياء ٣ث" */
  label: string;
}

interface FilterBarProps {
  search: ReactNode;
  /** Filter controls (Select…). Inline on desktop, in a bottom sheet on mobile. */
  filters?: ReactNode;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  /** Right-side actions: export, add… */
  actions?: ReactNode;
}

/** Search + filters + chips (clear-all) + actions for list pages. */
export function FilterBar({
  search,
  filters,
  activeFilters,
  onRemoveFilter,
  onClearAll,
  actions,
}: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 basis-64">{search}</div>
        {filters ? (
          <>
            <div className="hidden flex-wrap items-center gap-3 lg:flex [&>*]:w-48">{filters}</div>
            <Button
              variant="neutral"
              className="lg:hidden"
              iconStart={<SlidersHorizontal aria-hidden />}
              onClick={() => setSheetOpen(true)}
            >
              {ar.common.filters}
              {activeFilters.length ? (
                <span className="rounded-full bg-primary px-1.5 text-xs text-primary-ink tabular">
                  {formatNumber(activeFilters.length)}
                </span>
              ) : null}
            </Button>
          </>
        ) : null}
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      <AnimatePresence initial={false}>
        {activeFilters.length ? (
          <m.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            {activeFilters.map((filter) => (
              <li key={filter.key}>
                <button
                  type="button"
                  onClick={() => onRemoveFilter(filter.key)}
                  className="flex min-h-9 items-center gap-1.5 rounded-full bg-primary-tint ps-3 pe-2 text-sm text-primary transition-colors hover:bg-primary-soft"
                  aria-label={`${filter.label} — ${ar.common.delete}`}
                >
                  {filter.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={onClearAll}
                className="min-h-9 px-2 text-sm font-medium text-muted hover:text-danger"
              >
                {ar.common.clearAll}
              </button>
            </li>
          </m.ul>
        ) : null}
      </AnimatePresence>

      {filters ? (
        <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm lg:hidden" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] animate-rise flex-col gap-4 overflow-y-auto rounded-t-xl border border-line bg-surface p-5 shadow-lift lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Dialog.Title className="font-display text-lg font-semibold text-ink">
                  {ar.common.filters}
                </Dialog.Title>
                <Dialog.Close
                  aria-label={ar.common.close}
                  className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-primary-tint"
                >
                  <X className="size-5" aria-hidden />
                </Dialog.Close>
              </div>
              <div className="flex flex-col gap-4">{filters}</div>
              <div className="flex gap-3">
                <Button variant="neutral" fullWidth onClick={onClearAll}>
                  {ar.common.clearAll}
                </Button>
                <Button fullWidth onClick={() => setSheetOpen(false)}>
                  {ar.common.confirm}
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}
    </div>
  );
}
