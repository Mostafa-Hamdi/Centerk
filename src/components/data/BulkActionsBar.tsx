'use client';

import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { ar } from '@/i18n/ar';

interface BulkActionsBarProps {
  count: number;
  onClear: () => void;
  /** Buttons for the selected rows (export, notify, delete via ConfirmDialog…). */
  children: ReactNode;
}

/** Floating bar that springs up from the bottom while rows are selected. */
export function BulkActionsBar({ count, onClear, children }: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <m.div
          role="region"
          aria-label={ar.list.selected(count)}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-3 rounded-lg border border-line bg-ink p-3 text-primary-ink shadow-lift"
        >
          <span className="px-2 text-sm font-semibold tabular">{ar.list.selected(count)}</span>
          <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
          <button
            type="button"
            onClick={onClear}
            aria-label={ar.list.clearSelection}
            className="flex size-11 items-center justify-center rounded-md hover:bg-primary-ink/10"
          >
            <X className="size-5" aria-hidden />
          </button>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
