import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { inputClasses } from './Input';

/** Multi-line input sharing the Input styles. */
export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(inputClasses, 'h-auto resize-y py-3', className)}
      {...props}
    />
  );
}
