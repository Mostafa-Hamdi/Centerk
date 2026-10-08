import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends ComponentProps<'div'> {
  /** Lift + cyan border + reveal `.card-action` children on hover (for clickable cards). */
  interactive?: boolean;
}

/**
 * Floating card (radius 20, line border, soft shadow). With `interactive`, children can use
 * `group-hover/card:` utilities — e.g. rotate an icon chip or slide an arrow.
 */
export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'group/card rounded-lg border border-line bg-surface p-5 shadow-card',
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-300 ease-brand focus-within:border-cyan hover:-translate-y-1 hover:border-cyan hover:shadow-lift',
        className,
      )}
      {...props}
    />
  );
}
