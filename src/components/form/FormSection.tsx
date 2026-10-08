import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** 2 columns on desktop by default, 1 on mobile. */
  columns?: 1 | 2;
}

/** Titled card grouping related fields. Use `md:col-span-2` on a field to span both columns. */
export function FormSection({ title, description, children, columns = 2 }: FormSectionProps) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <header className="mb-5">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </header>
      <div className={cn('grid gap-5', columns === 2 && 'md:grid-cols-2')}>{children}</div>
    </section>
  );
}
