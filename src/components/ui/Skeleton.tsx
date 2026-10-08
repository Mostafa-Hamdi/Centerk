import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Pulse placeholder — size it like the final content to avoid layout shift. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div aria-hidden className={cn('animate-pulse rounded-sm bg-skeleton', className)} {...props} />
  );
}
