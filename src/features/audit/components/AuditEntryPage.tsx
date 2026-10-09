'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { formatDateTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { prettyJson, useGetAuditEntryQuery } from '../api';

const t = ar.audit;

/** /audit-log/[id] — one entry with before / after snapshots side by side. */
export function AuditEntryPage({ id }: { id: string }) {
  const { data: entry, error, refetch } = useGetAuditEntryQuery(id);

  if (error)
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  if (!entry) return <Skeleton className="h-96 w-full rounded-xl" />;

  const facts = [
    [t.columns.time, entry.occurredAt ? formatDateTime(entry.occurredAt) : '—'],
    [t.columns.entity, entry.entityType],
    [t.details.entityId, entry.entityId ?? '—'],
    [t.columns.reason, entry.reason ?? '—'],
  ] as const;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <div>
        <Link
          href={routes.audit.list}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary"
        >
          <ArrowRight className="size-4" aria-hidden />
          {t.title}
        </Link>
        <h1 className="mt-1 flex flex-wrap items-center gap-2 font-display text-2xl font-bold text-ink">
          {t.details.title}
          <Badge dir="ltr" tone="primary">
            {entry.action}
          </Badge>
        </h1>
      </div>

      <Card className="p-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="font-medium break-all text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-(--shell-gap) lg:grid-cols-2">
        {(
          [
            [t.details.before, entry.oldValue, 'bg-danger-tint/40'],
            [t.details.after, entry.newValue, 'bg-success-tint/40'],
          ] as const
        ).map(([label, value, tint]) => (
          <Card key={label} className="flex flex-col gap-3 p-5">
            <h2 className="font-display text-lg font-bold text-ink">{label}</h2>
            <pre
              dir="ltr"
              className={`max-h-[28rem] overflow-auto rounded-md p-4 text-start text-xs leading-relaxed whitespace-pre-wrap text-ink ${tint}`}
            >
              {prettyJson(value)}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
}
