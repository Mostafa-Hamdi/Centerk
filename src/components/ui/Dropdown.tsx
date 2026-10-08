'use client';

import * as Menu from '@radix-ui/react-dropdown-menu';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Radix dropdown primitives styled with tokens. */
export const Dropdown = Menu.Root;
export const DropdownTrigger = Menu.Trigger;
export const DropdownGroup = Menu.Group;
export const DropdownRadioGroup = Menu.RadioGroup;

export function DropdownContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        align="end"
        sideOffset={10}
        className={cn(
          'z-50 min-w-60 animate-rise rounded-lg border border-line bg-surface p-2 shadow-lift',
          className,
        )}
        {...props}
      >
        {children}
      </Menu.Content>
    </Menu.Portal>
  );
}

const itemClasses =
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-3 text-sm text-ink outline-none select-none transition-colors data-highlighted:bg-primary-tint data-highlighted:text-primary data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0';

export function DropdownItem({ className, ...props }: ComponentProps<typeof Menu.Item>) {
  return <Menu.Item className={cn(itemClasses, className)} {...props} />;
}

export function DropdownRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem className={cn(itemClasses, 'justify-between', className)} {...props}>
      {children}
      <Menu.ItemIndicator>
        <span className="block size-2 rounded-full bg-primary" />
      </Menu.ItemIndicator>
    </Menu.RadioItem>
  );
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <Menu.Label className="px-3 pt-1 pb-2 text-xs font-semibold text-muted">{children}</Menu.Label>
  );
}

export function DropdownSeparator() {
  return <Menu.Separator className="my-1.5 h-px bg-line" />;
}
