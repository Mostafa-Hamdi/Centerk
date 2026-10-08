'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { normalizeDigits } from '@/features/auth/schemas';
import { cn } from '@/lib/cn';

interface OtpInputProps {
  /** Digits typed so far; holes are spaces (e.g. "12 4"). */
  value: string;
  onChange: (value: string) => void;
  /** Fires once all boxes are filled. */
  onComplete?: (code: string) => void;
  length?: number;
  label: string;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  describedBy?: string;
}

/**
 * One-time-code boxes: auto-advance, backspace to previous, arrow keys, paste/SMS autofill,
 * Arabic-Indic digits accepted. Always laid out LTR like the code itself.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  label,
  invalid,
  disabled,
  autoFocus,
  describedBy,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, index) => (value[index] ?? ' ').trim());

  const focusBox = (index: number) => {
    const box = refs.current[Math.max(0, Math.min(index, length - 1))];
    box?.focus();
    box?.select();
  };

  const commit = (next: string[]) => {
    const joined = next
      .map((digit) => digit || ' ')
      .join('')
      .trimEnd();
    onChange(joined);
    if (next.every((digit) => digit !== '')) onComplete?.(next.join(''));
  };

  const fillFrom = (index: number, raw: string) => {
    const incoming = normalizeDigits(raw).replace(/\D/g, '');
    if (!incoming) return;
    const next = [...digits];
    let cursor = index;
    for (const digit of incoming) {
      if (cursor >= length) break;
      next[cursor] = digit;
      cursor += 1;
    }
    commit(next);
    focusBox(cursor);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
      } else if (index > 0) {
        next[index - 1] = '';
        focusBox(index - 1);
      }
      commit(next);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData('text'));
  };

  return (
    <div
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
      dir="ltr"
      className="flex justify-between gap-2"
    >
      {digits.map((digit, index) => (
        <input
          // Fixed-length list: the index is the identity.
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={digit}
          onChange={(event) => {
            fillFrom(index, event.target.value.slice(digit ? 1 : 0) || event.target.value);
          }}
          onKeyDown={(event) => {
            onKeyDown(index, event);
          }}
          onPaste={(event) => {
            onPaste(index, event);
          }}
          onFocus={(event) => {
            event.target.select();
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          aria-label={`${label} ${index + 1}`}
          aria-invalid={invalid}
          className={cn(
            'h-14 w-full min-w-0 rounded-md border border-line bg-surface text-center font-display text-2xl font-semibold text-ink tabular',
            'transition-[border-color,box-shadow,transform] duration-200 ease-brand',
            'focus:-translate-y-0.5 focus:border-primary focus:ring-4 focus:ring-primary-tint focus:outline-none',
            digit && 'border-primary-soft bg-primary-tint',
            invalid && 'border-danger bg-danger-tint',
          )}
        />
      ))}
    </div>
  );
}
