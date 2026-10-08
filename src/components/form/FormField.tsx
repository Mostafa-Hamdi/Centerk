'use client';

import { AnimatePresence, m } from 'framer-motion';
import { CircleAlert } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Extra content on the label row (e.g. "نسيت كلمة السر؟"). */
  labelAside?: ReactNode;
  className?: string;
  /** Receives the id/aria props to spread on the control. */
  children: (control: FieldControlProps) => ReactNode;
}

/** Label + control + hint + animated error, with ids and aria wiring done for you. */
export function FormField({
  label,
  error,
  hint,
  required,
  labelAside,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span aria-hidden className="ms-1 text-danger">
              *
            </span>
          ) : null}
        </label>
        {labelAside}
      </div>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy || undefined,
        'aria-required': required,
      })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      <AnimatePresence initial={false}>
        {error ? (
          <m.p
            key="error"
            id={errorId}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-sm text-danger"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden />
            {error}
          </m.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
