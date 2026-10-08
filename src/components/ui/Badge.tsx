import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5',
  {
    variants: {
      tone: {
        neutral: 'bg-canvas text-muted',
        primary: 'bg-primary-tint text-primary',
        info: 'bg-info-tint text-info',
        success: 'bg-success-tint text-success',
        warning: 'bg-warning-tint text-warning',
        danger: 'bg-danger-tint text-danger',
      },
      dot: { true: 'before:size-1.5 before:rounded-full before:bg-current' },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

/** Status pill. `dot` adds a leading status dot. */
export function Badge({
  className,
  tone,
  dot,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, dot }), className)} {...props} />;
}
