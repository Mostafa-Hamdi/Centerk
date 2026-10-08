'use client';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CheckboxProps extends Omit<RadixCheckbox.CheckboxProps, 'checked' | 'onCheckedChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
}

/** Radix checkbox with token styling and an optional clickable label. */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  className,
  id,
  ...props
}: CheckboxProps) {
  const fallbackId = useId();
  const controlId = id ?? fallbackId;
  return (
    <div className="inline-flex min-h-11 items-center gap-2.5">
      <RadixCheckbox.Root
        id={controlId}
        checked={checked}
        onCheckedChange={(value) => {
          onCheckedChange(value === true);
        }}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-[6px] border-2 border-line bg-surface transition-colors duration-200',
          'hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          className,
        )}
        {...props}
      >
        <RadixCheckbox.Indicator>
          <Check className="size-3.5 text-primary-ink" strokeWidth={3} aria-hidden />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label ? (
        <label htmlFor={controlId} className="cursor-pointer text-sm text-ink select-none">
          {label}
        </label>
      ) : null}
    </div>
  );
}
