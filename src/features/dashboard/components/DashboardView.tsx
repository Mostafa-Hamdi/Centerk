'use client';

import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  Percent,
  Plus,
  Receipt,
  UserRound,
  Wallet,
} from 'lucide-react';
import dynamic from 'next/dynamic';
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
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatMoney, formatNumber, formatPercent } from '@/lib/format';
import { selectMe } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useGetDashboardAlertsQuery,
  useGetDashboardSummaryQuery,
  useGetIncome7dQuery,
  useGetTodaySessionsQuery,
  type SessionStatus,
  type TodaySessionDto,
} from '../api';

const t = ar.dashboard;

const IncomeChart = dynamic(() => import('./IncomeChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-md" />,
});

const statusTone: Record<SessionStatus, 'success' | 'primary' | 'neutral' | 'danger'> = {
  Live: 'success',
  Upcoming: 'primary',
  Done: 'neutral',
  Cancelled: 'danger',
};

function Hero() {
  const me = useAppSelector(selectMe);
  const { data } = useGetDashboardSummaryQuery(undefined);
  const live = data?.sessionsToday.live ?? 0;
  const firstName = me?.fullName.split(' ')[0] ?? '';

  return (
    <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full bg-cyan-tint"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute end-40 -bottom-28 size-56 rounded-full bg-primary-tint"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute end-16 top-10 size-10 rounded-full border-4 border-cyan-light/60"
      />
      <div className="relative flex flex-col gap-5">
        <span
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
            live ? 'bg-success-tint text-success' : 'bg-canvas text-muted',
          )}
        >
          <span className="relative flex size-2.5" aria-hidden>
            {live ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
            ) : null}
            <span
              className={cn('relative size-2.5 rounded-full', live ? 'bg-success' : 'bg-muted')}
            />
          </span>
          {live ? t.liveNow(live) : t.noLive}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            {t.greeting(firstName)}
          </h1>
          <p className="mt-2 max-w-xl text-muted">{t.heroSub}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Can permission="attendance.create">
            <Link href={routes.attendance.list} className={buttonVariants({ size: 'lg' })}>
              <ClipboardCheck className="size-4" aria-hidden />
              {t.startAttendance}
            </Link>
          </Can>
          <Can permission="payments.create">
            <Link
              href={routes.payments.new}
              className={buttonVariants({ variant: 'success', size: 'lg' })}
            >
              <Wallet className="size-4" aria-hidden />
              {t.collectPayment}
            </Link>
          </Can>
          <Can permission="students.create">
            <Link
              href={routes.students.new}
              className={buttonVariants({ variant: 'info', size: 'lg' })}
            >
              <Plus className="size-4" aria-hidden />
              {t.addStudent}
            </Link>
          </Can>
        </div>
      </div>
    </section>
  );
}

/** Formats a value or shows "—" when the backend didn't send it. */
const orDash = (value: number | null, format: (value: number) => string) =>
  value === null ? '—' : format(value);

function Kpis() {
  const { data, isLoading, isError, refetch } = useGetDashboardSummaryQuery(undefined);
  if (isError) return <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />;
  if (isLoading || !data) {
    return (
      <div className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }
  // Values the backend doesn't send are null → "—" (see features/dashboard/normalize.ts).
  const { incomeToday, incomeYesterday, sessionsToday, openDues } = data;
  const change =
    incomeToday !== null && incomeYesterday
      ? (incomeToday - incomeYesterday) / incomeYesterday
      : null;
  return (
    <div className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t.kpi.incomeToday}
        value={orDash(incomeToday, formatMoney)}
        icon={Receipt}
        tone="success"
        trend={
          change === null
            ? undefined
            : {
                label: t.kpi.vsYesterday(
                  `${change >= 0 ? '+' : '−'}${formatPercent(Math.abs(change))}`,
                ),
                direction: change >= 0 ? 'up' : 'down',
              }
        }
      />
      <StatCard
        label={t.kpi.sessionsToday}
        value={orDash(sessionsToday.total, formatNumber)}
        icon={CalendarCheck}
        footer={
          sessionsToday.done !== null && sessionsToday.upcoming !== null ? (
            <p className="text-sm text-muted">
              {t.kpi.sessionsBreakdown(sessionsToday.done, sessionsToday.upcoming)}
            </p>
          ) : null
        }
      />
      <StatCard
        label={t.kpi.attendance}
        value={orDash(data.monthlyAttendanceRate, (rate) => formatPercent(rate))}
        icon={Percent}
        tone="cyan"
      />
      <StatCard
        label={t.kpi.openDues}
        value={orDash(openDues.total, formatMoney)}
        icon={Wallet}
        tone="warning"
        footer={
          openDues.count === null ? null : (
            <p className="text-sm text-muted">{t.kpi.openDuesCount(openDues.count)}</p>
          )
        }
      />
    </div>
  );
}

function SessionCard({ session }: { session: TodaySessionDto }) {
  const rate = session.expected ? session.present / session.expected : 0;
  return (
    <Card interactive className="relative flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display font-semibold text-ink">{session.groupName}</h3>
          <p className="mt-0.5 truncate text-sm text-muted">{session.teacherName}</p>
        </div>
        <Badge tone={statusTone[session.status]} dot>
          {t.status[session.status]}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="flex items-center gap-1.5 tabular" dir="ltr">
          <Clock className="size-4" aria-hidden />
          {session.startTime} – {session.endTime}
        </span>
        {session.hallName ? <span>{session.hallName}</span> : null}
      </div>
      {session.status === 'Upcoming' || session.status === 'Cancelled' ? null : (
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-brand"
              style={{ width: `${Math.round(rate * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted tabular">
            {t.attendanceOf(session.present, session.expected)}
          </span>
        </div>
      )}
      <Link
        href={routes.attendance.session(session.id)}
        className="absolute inset-0 rounded-lg"
        aria-label={`${session.groupName} — ${t.status[session.status]}`}
      >
        <ArrowLeft
          aria-hidden
          className="absolute end-4 bottom-4 size-4 text-primary opacity-0 transition-all duration-300 ease-brand group-hover/card:-translate-x-1 group-hover/card:opacity-100"
        />
      </Link>
    </Card>
  );
}

function TodaySessions() {
  const { data, isLoading, isError, refetch } = useGetTodaySessionsQuery(undefined);
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-semibold text-ink">{t.sessionsTitle}</h2>
      {isError ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid gap-(--shell-gap) md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="grid gap-(--shell-gap) md:grid-cols-2 2xl:grid-cols-3">
          {data.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState title={t.sessionsEmpty} icon={CalendarCheck} />
        </Card>
      )}
    </section>
  );
}

function Alerts() {
  const { data, isLoading, isError } = useGetDashboardAlertsQuery(undefined);
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold text-ink">{t.alertsTitle}</h2>
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-md" />
      ) : isError ? (
        <p className="py-6 text-center text-sm text-muted">{t.comingSoon}</p>
      ) : data?.some((alert) => alert.count > 0) ? (
        <ul className="flex flex-col gap-1">
          {data
            .filter((alert) => alert.count > 0)
            .map((alert) => (
              <li key={alert.type}>
                <Link
                  href={`${routes.students.list}?alert=${alert.type}`}
                  className="group/row flex min-h-12 items-center gap-3 rounded-md px-3 transition-all duration-200 ease-brand hover:-translate-x-0.5 hover:bg-primary-tint"
                >
                  <span className="flex min-w-9 items-center justify-center rounded-sm bg-warning-tint px-2 py-1 font-display text-sm font-bold text-warning tabular">
                    {formatNumber(alert.count)}
                  </span>
                  <span className="flex-1 text-sm text-ink">{t.alerts[alert.type]}</span>
                  <ChevronLeft
                    className="size-4 text-muted transition-transform group-hover/row:-translate-x-1"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
        </ul>
      ) : (
        <EmptyState title={t.alertsEmpty} icon={UserRound} className="py-6" />
      )}
    </Card>
  );
}

function Income() {
  const { data, isLoading, isError } = useGetIncome7dQuery(undefined);
  const total = data?.reduce((sum, point) => sum + point.amount, 0) ?? 0;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">{t.incomeTitle}</h2>
        {data ? (
          <span className="text-sm text-muted tabular">{t.incomeTotal(formatMoney(total))}</span>
        ) : null}
      </div>
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-md" />
      ) : isError || !data ? (
        <p className="flex h-64 items-center justify-center text-sm text-muted">{t.comingSoon}</p>
      ) : (
        <IncomeChart data={data} />
      )}
    </Card>
  );
}

/** Phase 3 dashboard: hero, KPIs, today's sessions, alerts and 7-day income. */
export function DashboardView() {
  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <Hero />
      <Kpis />
      <div className="grid gap-(--shell-gap) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Can permission="reports.view" fallback={<div />}>
          <Income />
        </Can>
        <Alerts />
      </div>
      <TodaySessions />
    </div>
  );
}
