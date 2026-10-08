import { ArrowDownLeft, ArrowUpLeft, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  /** Pre-formatted value (use lib/format). */
  value: ReactNode;
  icon: LucideIcon;
  /** e.g. "+١٢٪ عن امبارح" */
  trend?: { label: string; direction: 'up' | 'down'; positive?: boolean };
  tone?: 'primary' | 'cyan' | 'success' | 'warning' | 'danger';
  footer?: ReactNode;
}

const chip = {
  primary: 'bg-primary-tint text-primary',
  cyan: 'bg-cyan-tint text-cyan-deep',
  success: 'bg-success-tint text-success',
  warning: 'bg-warning-tint text-warning',
  danger: 'bg-danger-tint text-danger',
} as const;

/** KPI tile: big display-font number, tinted icon chip that tilts on hover, optional trend. */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = 'primary',
  footer,
}: StatCardProps) {
  const TrendIcon = trend?.direction === 'down' ? ArrowDownLeft : ArrowUpLeft;
  const good = trend ? (trend.positive ?? trend.direction === 'up') : true;
  return (
    <Card interactive className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-md transition-transform duration-300 ease-brand group-hover/card:-rotate-6',
            chip[tone],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="font-display text-3xl font-bold text-ink tabular">{value}</p>
      {trend ? (
        <p
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            good ? 'text-success' : 'text-danger',
          )}
        >
          <TrendIcon className="size-4" aria-hidden />
          {trend.label}
        </p>
      ) : null}
      {footer}
    </Card>
  );
}
