export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  /** ms; Infinity = stays until dismissed (loading). */
  duration: number;
  /** Bumped on every update so timers/progress restart. */
  version: number;
}

interface ToastOptions {
  id?: string;
  duration?: number;
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  info: 4500,
  warning: 6000,
  error: 7000,
  loading: Number.POSITIVE_INFINITY,
};

let toasts: readonly ToastItem[] = [];
const EMPTY: readonly ToastItem[] = [];
const listeners = new Set<() => void>();
let counter = 0;

const emit = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

function upsert(
  variant: ToastVariant,
  title: string,
  description?: string,
  options?: ToastOptions,
) {
  const id = options?.id ?? `toast-${(counter += 1)}`;
  const existing = toasts.find((item) => item.id === id);
  const next: ToastItem = {
    id,
    variant,
    title,
    description,
    duration: options?.duration ?? DEFAULT_DURATION[variant],
    version: (existing?.version ?? 0) + 1,
  };
  toasts = existing ? toasts.map((item) => (item.id === id ? next : item)) : [...toasts, next];
  emit();
  return id;
}

function dismiss(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

/** External store consumed by <Toaster/> via useSyncExternalStore. */
export const toastStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => toasts,
  getServerSnapshot: () => EMPTY,
};

type Message<T> = string | ((value: T) => string);
const resolve = <T>(message: Message<T>, value: T) =>
  typeof message === 'function' ? message(value) : message;

/**
 * Imperative toast API — callable from anywhere (components, RTK Query callbacks).
 * @example toast.success('تم الحفظ', 'اتضاف الطالب بنجاح')
 */
export const toast = {
  success: (title: string, description?: string, options?: ToastOptions) =>
    upsert('success', title, description, options),
  error: (title: string, description?: string, options?: ToastOptions) =>
    upsert('error', title, description, options),
  warning: (title: string, description?: string, options?: ToastOptions) =>
    upsert('warning', title, description, options),
  info: (title: string, description?: string, options?: ToastOptions) =>
    upsert('info', title, description, options),
  dismiss,
  /** Shows a loading toast that turns into success/error when the promise settles. */
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: Message<T>; error: Message<unknown> },
  ): Promise<T> {
    const id = upsert('loading', messages.loading);
    promise.then(
      (value) => upsert('success', resolve(messages.success, value), undefined, { id }),
      (error: unknown) => upsert('error', resolve(messages.error, error), undefined, { id }),
    );
    return promise;
  },
};
