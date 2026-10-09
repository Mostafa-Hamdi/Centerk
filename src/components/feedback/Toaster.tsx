'use client';

import { AnimatePresence, m, type PanInfo } from 'framer-motion';
import { AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { toastStore, toast, type ToastItem, type ToastVariant } from './toast';

const MAX_VISIBLE = 3;
const SWIPE_DISTANCE = 80;

const styles: Record<ToastVariant, { edge: string; chip: string; glow: string }> = {
  success: {
    edge: 'bg-success',
    chip: 'bg-success-tint text-success',
    glow: 'shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--success)_60%,transparent)]',
  },
  error: {
    edge: 'bg-danger',
    chip: 'bg-danger-tint text-danger',
    glow: 'shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--danger)_60%,transparent)]',
  },
  warning: {
    edge: 'bg-warning',
    chip: 'bg-warning-tint text-warning',
    glow: 'shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--warning)_60%,transparent)]',
  },
  info: {
    edge: 'bg-cyan',
    chip: 'bg-info-tint text-info',
    glow: 'shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--cyan)_60%,transparent)]',
  },
  loading: {
    edge: 'bg-primary',
    chip: 'bg-primary-tint text-primary',
    glow: 'shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--primary)_60%,transparent)]',
  },
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'success') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <m.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
        />
      </svg>
    );
  }
  if (variant === 'error') {
    return (
      <m.span
        className="flex"
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -14, 12, -8, 6, 0] }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <X className="size-5" strokeWidth={2.4} aria-hidden />
      </m.span>
    );
  }
  if (variant === 'loading') return <Loader2 className="size-5 animate-spin" aria-hidden />;
  const Icon = variant === 'warning' ? AlertTriangle : Info;
  return (
    <m.span
      className="flex"
      initial={{ scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    >
      <Icon className="size-5" aria-hidden />
    </m.span>
  );
}

/** Auto-dismiss timer that pauses (keeping the remaining time) while hovered/focused. */
function useAutoDismiss(item: ToastItem, paused: boolean) {
  const remaining = useRef(item.duration);

  useEffect(() => {
    remaining.current = item.duration;
  }, [item.duration, item.version]);

  useEffect(() => {
    if (paused || !Number.isFinite(item.duration)) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => {
      toast.dismiss(item.id);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, item.id, item.duration, item.version]);
}

function ToastCard({ item }: { item: ToastItem }) {
  const [paused, setPaused] = useState(false);
  useAutoDismiss(item, paused);
  const style = styles[item.variant];

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > 600) {
      toast.dismiss(item.id);
    }
  };

  return (
    <m.li
      layout
      initial={{ opacity: 0, y: -24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      onPointerEnter={() => {
        setPaused(true);
      }}
      onPointerLeave={() => {
        setPaused(false);
      }}
      onFocus={() => {
        setPaused(true);
      }}
      onBlur={() => {
        setPaused(false);
      }}
      role={item.variant === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
      className={cn(
        'pointer-events-auto relative touch-pan-y overflow-hidden rounded-lg border border-line glass p-4 ps-5',
        style.glow,
      )}
    >
      <span aria-hidden className={cn('absolute inset-y-0 start-0 w-1', style.edge)} />
      <div className="flex items-start gap-3">
        <span
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-sm', style.chip)}
        >
          <ToastIcon variant={item.variant} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-display text-sm font-semibold text-ink">{item.title}</p>
          {item.description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(item.id);
          }}
          aria-label={ar.toaster.dismiss}
          className="-me-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-primary-tint hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {Number.isFinite(item.duration) ? (
        <span
          key={item.version}
          aria-hidden
          className={cn('absolute start-0 bottom-0 h-0.5 opacity-70', style.edge)}
          style={{
            animation: `toast-progress ${item.duration}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      ) : null}
    </m.li>
  );
}

/** Mount once (root providers). Top-start in RTL, newest on top, max 3 visible. */
export function Toaster() {
  const items = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  );
  const visible = items.slice(-MAX_VISIBLE).reverse();

  return (
    <section
      aria-label={ar.toaster.region}
      className="pointer-events-none fixed inset-x-4 top-[100px] z-50 mx-auto sm:w-96"
    >
      <ol aria-live="polite" className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <ToastCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </ol>
    </section>
  );
}
