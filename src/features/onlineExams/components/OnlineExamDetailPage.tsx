'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, CalendarClock, ListChecks, Pencil, Timer, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  isDraft,
  useGetOnlineExamQuery,
  useGetOnlineExamResultsQuery,
  type ExamResultDto,
} from '../api';

const t = ar.onlineExams;
const PAGE_SIZE = 20;

/** /online-exams/[id] — exam summary and student results. */
export function OnlineExamDetailPage({ id }: { id: string }) {
  const { data: exam, error, refetch } = useGetOnlineExamQuery(id);
  const [page, setPage] = useState(1);
  const results = useGetOnlineExamResultsQuery({ id, page, pageSize: PAGE_SIZE, filters: {} });

  const columns = useMemo<ColumnDef<ExamResultDto>[]>(
    () => [
      {
        accessorKey: 'studentName',
        header: t.details.columns.student,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.studentName}</span>
            {row.original.studentCode ? (
              <span dir="ltr" className="text-xs text-muted tabular">
                {row.original.studentCode}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'score',
        header: t.details.columns.score,
        meta: { className: 'tabular' },
        cell: ({ row }) =>
          row.original.score === null
            ? '—'
            : row.original.maxScore
              ? `${formatNumber(row.original.score)} / ${formatNumber(row.original.maxScore)}`
              : formatNumber(row.original.score),
      },
      {
        accessorKey: 'status',
        header: t.details.columns.status,
        cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
      },
      {
        accessorKey: 'submittedAt',
        header: t.details.columns.submitted,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
    ],
    [],
  );

  if (error)
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  if (!exam) return <Skeleton className="h-96 w-full rounded-xl" />;

  const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={routes.onlineExams.list}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary"
          >
            <ArrowRight className="size-4" aria-hidden />
            {t.title}
          </Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 font-display text-2xl font-bold text-ink">
            {exam.title}
            <Badge dot>{t.status[exam.status] ?? exam.status}</Badge>
          </h1>
        </div>
        {isDraft(exam) ? (
          <Can permission="onlineExams.manage">
            <Link
              href={routes.onlineExams.edit(id)}
              className={buttonVariants({ variant: 'info', size: 'lg' })}
            >
              <Pencil className="size-4" aria-hidden />
              {ar.common.edit}
            </Link>
          </Can>
        ) : null}
      </div>

      <div className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.form.opensAt}
          value={exam.opensAt ? formatDateTime(exam.opensAt) : '—'}
          icon={CalendarClock}
          tone="cyan"
        />
        <StatCard
          label={t.form.closesAt}
          value={exam.closesAt ? formatDateTime(exam.closesAt) : '—'}
          icon={CalendarClock}
          tone="warning"
        />
        <StatCard label={t.columns.duration} value={t.minutes(exam.durationMinutes)} icon={Timer} />
        <StatCard
          label={t.details.questions(exam.questions.length)}
          value={formatNumber(totalPoints)}
          icon={ListChecks}
          tone="success"
        />
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <h2 className="font-display text-lg font-bold text-ink">{t.results}</h2>
        <DataTable
          caption={t.results}
          data={results.data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={results.isLoading}
          isFetching={results.isFetching}
          error={results.error ? toProblem(results.error).title : null}
          onRetry={() => void results.refetch()}
          empty={<EmptyState icon={Trophy} title={t.details.resultsEmpty} />}
        />
        {results.data && results.data.totalPages > 1 ? (
          <Pagination
            page={results.data.page}
            totalPages={results.data.totalPages}
            totalCount={results.data.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onPageSizeChange={() => undefined}
          />
        ) : null}
      </section>
    </div>
  );
}
