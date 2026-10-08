import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Primary call to action, e.g. "إضافة طالب". */
  action?: ReactNode;
  className?: string;
}

/** Friendly empty list / no-results state. */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-4 py-12 text-center', className)}>
      <span className="flex size-16 items-center justify-center rounded-xl bg-primary-tint text-primary">
        <Icon className="size-8" aria-hidden />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
