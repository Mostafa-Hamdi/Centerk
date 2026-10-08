import { RotateCw, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  /** Extra actions next to retry. */
  actions?: ReactNode;
  className?: string;
}

/** Error panel with optional retry, used for failed queries and route errors. */
export function ErrorState({
  title,
  description,
  onRetry,
  retrying,
  actions,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-3 px-4 py-10 text-center', className)}
    >
      <span className="flex size-14 items-center justify-center rounded-lg bg-danger-tint text-danger">
        <TriangleAlert className="size-7" aria-hidden />
      </span>
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button
            variant="neutral"
            onClick={onRetry}
            loading={retrying}
            iconStart={<RotateCw aria-hidden />}
          >
            {ar.common.retry}
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
