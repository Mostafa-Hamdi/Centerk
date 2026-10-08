import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Loader2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Color = purpose:
 * primary (main page action) · success (money/academic positive) · danger (destructive, via ConfirmDialog)
 * · warning (postpone/override) · info (export/print/view) · neutral (cancel/back) · ghost (low emphasis).
 */
export const buttonVariants = cva(
  [
    'group/button relative inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-brand',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'disabled:pointer-events-none disabled:opacity-55 aria-busy:cursor-progress',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-ink hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_12px_28px_-10px_var(--primary)] active:translate-y-0',
        success:
          'bg-success text-primary-ink hover:-translate-y-0.5 hover:bg-success-hover hover:shadow-[0_12px_28px_-10px_var(--success)] active:translate-y-0',
        danger: 'bg-danger text-primary-ink hover:bg-danger-hover',
        warning: 'bg-warning text-primary-ink hover:bg-warning-hover',
        info: 'border border-cyan-deep/40 bg-surface text-cyan-deep hover:border-cyan-deep hover:bg-info-tint',
        neutral: 'border border-line bg-surface text-ink hover:border-primary',
        ghost: 'text-muted hover:bg-primary-tint hover:text-ink',
      },
      size: {
        sm: 'px-3 text-sm',
        md: 'px-5 text-sm',
        lg: 'min-h-12 px-6 text-base',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

/** Accessible button with purpose-based variants, loading state and icon slots (≥44px target). */
export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  iconStart,
  iconEnd,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const start = loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : iconStart;
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {start ? (
        <span
          className={cn(
            'flex shrink-0 [&_svg]:size-4',
            variant === 'danger' && !loading && 'group-hover/button:animate-shake',
          )}
        >
          {start}
        </span>
      ) : null}
      {children}
      {variant === 'success' && !loading ? (
        <Check
          aria-hidden
          className="-ms-2 size-4 w-0 opacity-0 transition-all duration-200 ease-brand group-hover/button:ms-0 group-hover/button:w-4 group-hover/button:opacity-100"
        />
      ) : null}
      {iconEnd ? <span className="flex shrink-0 [&_svg]:size-4">{iconEnd}</span> : null}
    </button>
  );
}
