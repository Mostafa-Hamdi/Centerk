'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: RadixTooltip.TooltipContentProps['side'];
  /** Render the trigger without a tooltip (e.g. sidebar expanded). */
  disabled?: boolean;
}

/** Radix tooltip in brand style. Needs <TooltipProvider> (mounted in AppShell). */
export function Tooltip({ content, children, side = 'left', disabled }: TooltipProps) {
  if (disabled) return children;
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={10}
          className="z-50 rounded-sm bg-ink px-3 py-1.5 text-sm font-medium text-primary-ink shadow-card data-[state=delayed-open]:animate-rise"
        >
          {content}
          <RadixTooltip.Arrow className="fill-ink" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export const TooltipProvider = RadixTooltip.Provider;
