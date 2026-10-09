'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { inputClasses } from './Input';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/** Radix select styled like Input. Spread FormField control props onto it. */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  ...aria
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled} dir="rtl">
      <RadixSelect.Trigger
        {...aria}
        className={cn(
          inputClasses,
          'flex items-center justify-between gap-2 text-start data-placeholder:text-muted/70',
          className,
        )}
      >
        <RadixSelect.Value
          placeholder={placeholder ? ar.list.pickPlaceholder(placeholder) : undefined}
        />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-muted" aria-hidden />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 min-w-(--radix-select-trigger-width) animate-rise overflow-hidden rounded-lg border border-line bg-surface p-1.5 shadow-lift"
        >
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-sm px-3 text-sm text-ink outline-none select-none data-highlighted:bg-primary-tint data-highlighted:text-primary data-[state=checked]:font-semibold"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check className="size-4 text-primary" aria-hidden />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
