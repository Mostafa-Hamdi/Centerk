'use client';

import { format } from 'date-fns';
import { ClipboardCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { useGetSessionsQuery } from '@/features/sessions/api';
import { ar } from '@/i18n/ar';
import { formatTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';

const t = ar.attendance;

/** /attendance — pick one of today's sessions to open the scan screen. */
export function AttendanceIndexPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data, isLoading, error, refetch } = useGetSessionsQuery({ from: today, to: today });
  const open = data?.filter((session) => session.status !== 'Cancelled') ?? [];

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>
      {error ? (
        <ErrorState
          title={ar.list.loadError}
          description={toProblem(error).title}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : open.length ? (
        <div className="grid gap-(--shell-gap) md:grid-cols-2 xl:grid-cols-3">
          {open.map((session) => (
            <Card key={session.id} interactive className="relative flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display font-semibold text-ink">{session.groupName}</h2>
                <Badge tone={session.status === 'Live' ? 'success' : 'primary'} dot>
                  {ar.sessions.status[session.status]}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <Clock className="size-4" aria-hidden />
                {session.startsAt ? formatTime(session.startsAt) : '—'}
                {session.hallName ? ` · ${session.hallName}` : null}
              </p>
              <Link
                href={routes.attendance.session(session.id)}
                className="absolute inset-0 rounded-lg"
                aria-label={`${t.open}: ${session.groupName}`}
              />
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState title={t.todayEmpty} icon={ClipboardCheck} />
        </Card>
      )}
    </div>
  );
}
