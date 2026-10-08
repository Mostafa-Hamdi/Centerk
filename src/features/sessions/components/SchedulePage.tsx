'use client';

import { addDays, format, startOfWeek } from 'date-fns';
import { CalendarClock, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatDate, formatTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useCancelSessionMutation,
  useGetSessionsQuery,
  type SessionDto,
  type SessionState,
} from '../api';
import { PostponeDialog } from './PostponeDialog';

const t = ar.sessions;
const ISO = 'yyyy-MM-dd';

const statusTone: Record<SessionState, 'primary' | 'success' | 'neutral' | 'danger' | 'warning'> = {
  Scheduled: 'primary',
  Live: 'success',
  Done: 'neutral',
  Cancelled: 'danger',
  Postponed: 'warning',
};

/** Egyptian week: Saturday → Friday. `?week=YYYY-MM-DD` keeps the selected week in the URL. */
function useWeek() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = searchParams.get('week');
  const start = startOfWeek(param ? new Date(`${param}T12:00:00`) : new Date(), {
    weekStartsOn: 6,
  });
  const go = (days: number) => {
    const next = format(addDays(start, days), ISO);
    router.replace(`${pathname}?week=${next}`, { scroll: false });
  };
  return { start, days: Array.from({ length: 7 }, (_, index) => addDays(start, index)), go };
}

function SessionRow({
  session,
  onPostpone,
  onCancel,
}: {
  session: SessionDto;
  onPostpone: () => void;
  onCancel: () => void;
}) {
  const actionable = session.status === 'Scheduled' || session.status === 'Postponed';
  return (
    <li className="group/row flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface p-3 transition-colors hover:border-primary-soft hover:bg-primary-tint/40">
      <span className="flex min-w-16 items-center gap-1.5 text-sm font-semibold text-ink tabular">
        <Clock className="size-4 text-muted" aria-hidden />
        {session.startsAt ? formatTime(session.startsAt) : '—'}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium text-ink',
            session.status === 'Cancelled' && 'line-through opacity-60',
          )}
        >
          {session.groupName}
        </p>
        <p className="text-xs text-muted">
          {[session.hallName, t.kind[session.kind]].filter(Boolean).join(' · ')}
        </p>
      </div>
      <Badge tone={statusTone[session.status]} dot>
        {t.status[session.status]}
      </Badge>
      {actionable ? (
        <Can permission="sessions.manage">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-warning"
              onClick={onPostpone}
              iconStart={<CalendarClock aria-hidden />}
            >
              {t.postpone}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger"
              onClick={onCancel}
              iconStart={<XCircle aria-hidden />}
            >
              {t.cancel}
            </Button>
          </div>
        </Can>
      ) : null}
    </li>
  );
}

/** /sessions — weekly schedule from the live GET /sessions with postpone/cancel. */
export function SchedulePage() {
  const week = useWeek();
  const range = {
    from: format(week.days[0] ?? week.start, ISO),
    to: format(week.days[6] ?? week.start, ISO),
  };
  const { data, isLoading, error, refetch, isFetching } = useGetSessionsQuery(range);
  const [cancelSession] = useCancelSessionMutation();
  const [postponing, setPostponing] = useState<SessionDto | null>(null);
  const [cancelling, setCancelling] = useState<SessionDto | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, SessionDto[]>();
    for (const session of data ?? []) {
      const key = session.startsAt ? formatDate(session.startsAt, 'short') : '';
      map.set(key, [...(map.get(key) ?? []), session]);
    }
    return map;
  }, [data]);

  const confirmCancel = async (reason?: string) => {
    if (!cancelling) return;
    try {
      await cancelSession({ id: cancelling.id, reason: reason ?? '', notify: true }).unwrap();
      toast.success(t.cancelled, cancelling.groupName);
    } catch (caught) {
      toast.error(toProblem(caught).title);
      throw caught;
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <Link href={routes.groups.list} className={buttonVariants({ variant: 'neutral' })}>
          {t.groupsLink}
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 shadow-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => week.go(-7)}
          iconStart={<ChevronRight aria-hidden />}
        >
          {t.previousWeek}
        </Button>
        <p
          className={cn(
            'text-sm font-medium text-ink transition-opacity',
            isFetching && 'opacity-50',
          )}
        >
          {t.weekOf(formatDate(week.days[0] ?? week.start), formatDate(week.days[6] ?? week.start))}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => week.go(7)}
          iconEnd={<ChevronLeft aria-hidden />}
        >
          {t.nextWeek}
        </Button>
      </div>

      {error ? (
        <ErrorState
          title={ar.list.loadError}
          description={toProblem(error).title}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : data?.length ? (
        <div className="grid gap-(--shell-gap) md:grid-cols-2 xl:grid-cols-3">
          {week.days.map((day) => {
            const key = formatDate(day, 'short');
            const sessions = byDay.get(key) ?? [];
            return (
              <Card key={key} className="flex flex-col gap-3 p-4">
                <h2 className="flex items-baseline justify-between font-display font-semibold text-ink">
                  {ar.groups.days[day.getDay()]}
                  <span className="text-xs font-normal text-muted">
                    {formatDate(day, 'medium')}
                  </span>
                </h2>
                {sessions.length ? (
                  <ul className="flex flex-col gap-2">
                    {sessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        onPostpone={() => setPostponing(session)}
                        onCancel={() => setCancelling(session)}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-muted">{t.noSessions}</p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState title={t.emptyWeek} icon={CalendarClock} />
        </Card>
      )}

      <PostponeDialog session={postponing} onClose={() => setPostponing(null)} />
      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => !open && setCancelling(null)}
        title={t.cancel}
        questionPrefix={t.cancelQuestion}
        itemName={cancelling?.groupName ?? ''}
        description={t.cancelDesc}
        confirmLabel={t.cancel}
        requireReason
        onConfirm={confirmCancel}
      />
    </div>
  );
}
