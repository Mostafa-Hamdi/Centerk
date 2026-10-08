'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { m } from 'framer-motion';
import { createContext, use, useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const TabsContext = createContext<{ value: string; indicatorId: string } | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

/** Controlled Radix tabs with an animated sliding indicator. */
export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const indicatorId = useId();
  return (
    <TabsContext value={{ value, indicatorId }}>
      <RadixTabs.Root value={value} onValueChange={onValueChange} dir="rtl" className={className}>
        {children}
      </RadixTabs.Root>
    </TabsContext>
  );
}

export function TabsList({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <RadixTabs.List
      aria-label={label}
      className={cn(
        'grid auto-cols-fr grid-flow-col gap-1 rounded-md border border-line bg-canvas p-1',
        className,
      )}
    >
      {children}
    </RadixTabs.List>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const context = use(TabsContext);
  const active = context?.value === value;
  return (
    <RadixTabs.Trigger
      value={value}
      className="relative isolate min-h-11 rounded-sm px-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink data-[state=active]:text-primary"
    >
      {active ? (
        <m.span
          layoutId={context.indicatorId}
          aria-hidden
          className="absolute inset-0 -z-10 rounded-sm bg-surface shadow-card"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      ) : null}
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Content value={value} className={cn('focus-visible:outline-none', className)}>
      {children}
    </RadixTabs.Content>
  );
}
