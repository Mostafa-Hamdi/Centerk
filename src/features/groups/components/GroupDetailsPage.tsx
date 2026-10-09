'use client';

import { ArrowRight, CalendarClock, Pencil, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { GroupStudentsCard } from '@/features/account/components/GroupStudentsCard';
import { ar } from '@/i18n/ar';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetGroupQuery, useGetGroupScheduleQuery } from '../api';

const t = ar.groups;

/** /groups/[id] — group profile with weekly schedule. */
export function GroupDetailsPage({ id }: { id: string }) {
  const { data: group, error, refetch } = useGetGroupQuery(id);
  const schedule = useGetGroupScheduleQuery(id);

  if (error) {
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!group) return <Skeleton className="h-96 rounded-xl" />;

  const slots = (schedule.data?.length ? schedule.data : group.schedule)
    .slice()
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <div className="flex items-start gap-3">
          <Link
            href={routes.groups.list}
            aria-label={ar.common.back}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line text-muted hover:border-primary hover:text-primary"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">{group.name}</h1>
              <Badge tone={group.status === 'Active' ? 'success' : 'warning'} dot>
                {t.status[group.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {group.subject} · {group.grade}
              {group.teacherName ? ` · ${group.teacherName}` : null}
            </p>
          </div>
        </div>
        <Can permission="groups.update">
          <Link href={routes.groups.edit(id)} className={buttonVariants({ variant: 'neutral' })}>
            <Pencil className="size-4" aria-hidden />
            {ar.common.edit}
          </Link>
        </Can>
      </header>

      <div className="grid gap-(--shell-gap) md:grid-cols-3">
        <StatCard
          label={t.columns.enrolled}
          value={t.seats(group.enrolledCount, group.capacity)}
          icon={Users}
        />
        <StatCard
          label={t.columns.price}
          value={formatMoney(group.price)}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label={t.columns.hall}
          value={group.hallName ?? '—'}
          icon={CalendarClock}
          tone="cyan"
        />
      </div>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">{t.details.schedule}</h2>
        {schedule.isLoading ? (
          <Skeleton className="h-24 w-full rounded-md" />
        ) : slots.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <li
                key={`${slot.dayOfWeek}-${slot.startTime}`}
                className="flex items-center justify-between gap-3 rounded-md border border-line bg-canvas p-4"
              >
                <span className="font-display font-semibold text-ink">
                  {t.days[slot.dayOfWeek] ?? '—'}
                </span>
                <span className="flex flex-col items-end text-sm">
                  <span dir="ltr" className="text-ink tabular">
                    {slot.startTime}
                  </span>
                  <span className="text-xs text-muted">
                    {t.details.minutes(slot.durationMinutes)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t.details.noSchedule} icon={CalendarClock} className="py-6" />
        )}
      </Card>

      <GroupStudentsCard groupId={id} />
    </div>
  );
}
