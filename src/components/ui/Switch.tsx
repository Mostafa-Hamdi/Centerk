'use client';

import * as RadixSwitch from '@radix-ui/react-switch';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
}

/** Radix switch; the thumb slides toward the end in RTL. */
export function Switch({ checked, onCheckedChange, label, disabled, id }: SwitchProps) {
  const fallbackId = useId();
  const controlId = id ?? fallbackId;
  return (
    <div className="inline-flex min-h-11 items-center gap-3">
      <RadixSwitch.Root
        id={controlId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full bg-line transition-colors duration-200 disabled:opacity-50 data-[state=checked]:bg-primary',
        )}
      >
        <RadixSwitch.Thumb className="block size-5 translate-x-[-2px] rounded-full bg-surface shadow-card transition-transform duration-200 ease-brand data-[state=checked]:translate-x-[-22px]" />
      </RadixSwitch.Root>
      {label ? (
        <label htmlFor={controlId} className="cursor-pointer text-sm text-ink select-none">
          {label}
        </label>
      ) : null}
    </div>
  );
}
