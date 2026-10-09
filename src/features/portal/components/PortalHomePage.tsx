'use client';

import { CalendarClock, CreditCard, Percent, Trophy, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/data/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatMoney, formatNumber, formatPercent } from '@/lib/format';
import { selectMe } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useGetPortalBalanceQuery,
  useGetPortalCardQuery,
  useGetPortalChildrenQuery,
  useGetPortalOverviewQuery,
  useGetPortalSessionsQuery,
} from '../api';
import { PortalExcusesCard } from './PortalExcusesCard';

const t = ar.portal;
const attendanceTone = { Present: 'success', Late: 'warning', Absent: 'danger' } as const;

/** /portal — guardian / student home: child switcher, KPIs, recent sessions, balance, card. */
export function PortalHomePage() {
  const me = useAppSelector(selectMe);
  const children = useGetPortalChildrenQuery(undefined);
  const [selected, setSelected] = useState<string | null>(null);
  const studentId = selected ?? children.data?.[0]?.id ?? null;

  if (children.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void children.refetch()} />;
  if (!children.data) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          {me ? <p className="mt-1 text-muted">{me.fullName}</p> : null}
        </div>
        {children.data.length > 1 ? (
          <div className="w-full sm:w-64">
            <Select
              aria-label={t.child}
              value={studentId ?? undefined}
              onValueChange={setSelected}
              options={children.data.map((child) => ({ value: child.id, label: child.name }))}
            />
          </div>
        ) : null}
      </header>

      {studentId ? (
        <StudentPanel key={studentId} studentId={studentId} showCard={me?.kind === 'Student'} />
      ) : (
        <EmptyState icon={Trophy} title={t.noChildren} />
      )}
    </div>
  );
}

function StudentPanel({ studentId, showCard }: { studentId: string; showCard: boolean }) {
  const overview = useGetPortalOverviewQuery(studentId);
  const balance = useGetPortalBalanceQuery(studentId);
  const [page, setPage] = useState(1);
  const sessions = useGetPortalSessionsQuery({ studentId, page });
  const card = useGetPortalCardQuery(undefined, { skip: !showCard });

  const ratio = (value: number | null) =>
    value === null ? '—' : formatPercent(value > 1 ? value / 100 : value);

  return (
    <>
      <div className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.attendance}
          value={overview.data ? ratio(overview.data.attendancePercent) : '…'}
          icon={Percent}
          tone="success"
        />
        <StatCard
          label={t.average}
          value={
            overview.data?.averageScore === null || overview.data?.averageScore === undefined
              ? '—'
              : formatNumber(overview.data.averageScore)
          }
          icon={Trophy}
          tone="cyan"
        />
        <StatCard
          label={t.nextSession}
          value={
            overview.data?.nextSession?.startsAt
              ? formatDateTime(overview.data.nextSession.startsAt)
              : t.noNextSession
          }
          icon={CalendarClock}
          footer={overview.data?.nextSession?.topic ?? undefined}
        />
        <StatCard
          label={t.due}
          value={balance.data ? formatMoney(balance.data.totalDue) : '…'}
          icon={Wallet}
          tone={balance.data && balance.data.totalDue > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid items-start gap-(--shell-gap) xl:grid-cols-3">
        <Card className="flex flex-col gap-3 p-5 xl:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink">{t.sessions}</h2>
          {sessions.isLoading ? (
            <Skeleton className="h-48 w-full rounded-md" />
          ) : sessions.data?.items.length ? (
            <ul className="flex flex-col divide-y divide-line">
              {sessions.data.items.map((session) => {
                const status = session.attendance ?? '';
                return (
                  <li
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="font-medium text-ink">
                        {session.startsAt ? formatDateTime(session.startsAt) : '—'}
                      </p>
                      {session.topic ? <p className="text-sm text-muted">{session.topic}</p> : null}
                      {session.quizzes.map((quiz) => (
                        <p key={quiz.title} className="text-sm text-muted">
                          {t.quiz(
                            quiz.title,
                            quiz.score === null
                              ? '—'
                              : `${formatNumber(quiz.score)}${quiz.maxScore ? ` / ${formatNumber(quiz.maxScore)}` : ''}`,
                          )}
                        </p>
                      ))}
                    </div>
                    {session.attendance ? (
                      <Badge
                        tone={
                          status in attendanceTone
                            ? attendanceTone[status as keyof typeof attendanceTone]
                            : 'neutral'
                        }
                        dot
                      >
                        {t.attendanceStatus[status] ?? status}
                      </Badge>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">{t.sessionsEmpty}</p>
          )}
          {sessions.data && sessions.data.totalPages > 1 ? (
            <Pagination
              page={sessions.data.page}
              totalPages={sessions.data.totalPages}
              totalCount={sessions.data.totalCount}
              pageSize={10}
              onPageChange={setPage}
              onPageSizeChange={() => undefined}
            />
          ) : null}
        </Card>

        <div className="flex flex-col gap-(--shell-gap)">
          {showCard && card.data ? (
            <Card className="flex flex-col items-center gap-2 p-5 text-center">
              <CreditCard className="size-8 text-primary" aria-hidden />
              <h2 className="font-display text-lg font-bold text-ink">{t.card}</h2>
              <p className="font-medium text-ink">{card.data.name}</p>
              {card.data.grade ? <p className="text-sm text-muted">{card.data.grade}</p> : null}
              <p
                dir="ltr"
                className="rounded-md bg-canvas px-4 py-2 font-display text-2xl font-bold tracking-widest text-ink"
              >
                {card.data.code ?? '—'}
              </p>
              <p className="text-xs text-muted">{t.cardHint}</p>
            </Card>
          ) : null}

          <PortalExcusesCard studentId={studentId} />

          <Card className="flex flex-col gap-3 p-5">
            <h2 className="font-display text-lg font-bold text-ink">{t.balance}</h2>
            {balance.data?.charges.length ? (
              <ul className="flex flex-col divide-y divide-line text-sm">
                {balance.data.charges.map((charge) => (
                  <li key={charge.id} className="flex flex-col gap-1 py-2">
                    <span className="font-medium text-ink">{charge.period ?? '—'}</span>
                    <span className="flex justify-between text-muted tabular">
                      <span>
                        {t.paid}: {formatMoney(charge.paid)}
                      </span>
                      <span className={charge.remaining > 0 ? 'text-danger' : 'text-success'}>
                        {t.remaining}: {formatMoney(charge.remaining)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t.balanceEmpty}</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
