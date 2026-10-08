import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const inputClasses = cn(
  'h-12 w-full rounded-md border border-line bg-surface px-4 text-base text-ink placeholder:text-muted/70',
  'transition-[border-color,box-shadow] duration-200 ease-brand hover:border-primary-soft',
  'focus:border-primary focus:ring-4 focus:ring-primary-tint focus:outline-none',
  'aria-invalid:border-danger aria-invalid:focus:ring-danger-tint',
  'disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-70',
);

export interface InputProps extends ComponentProps<'input'> {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

/** Text input styled with tokens. Wire label/errors through <FormField>. */
export function Input({ className, startAdornment, endAdornment, ...props }: InputProps) {
  if (!startAdornment && !endAdornment) {
    return <input className={cn(inputClasses, className)} {...props} />;
  }
  return (
    <div className="relative">
      {startAdornment ? (
        <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-muted [&_svg]:size-5">
          {startAdornment}
        </span>
      ) : null}
      <input
        className={cn(inputClasses, startAdornment && 'ps-11', endAdornment && 'pe-12', className)}
        {...props}
      />
      {endAdornment ? (
        <span className="absolute inset-y-0 end-1 flex items-center">{endAdornment}</span>
      ) : null}
    </div>
  );
}
