'use client';

import { ArrowRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Pagination } from '@/components/data/Pagination';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useGetAssignmentQuery,
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
  type SubmissionDto,
} from '../api';

const t = ar.content.assignments;
const PAGE_SIZE = 20;

/** /content/assignments/[id] — the assignment's submissions with inline score + feedback. */
export function AssignmentDetailPage({ id }: { id: string }) {
  const { data: assignment, error, refetch } = useGetAssignmentQuery(id);
  const [page, setPage] = useState(1);
  const submissions = useGetSubmissionsQuery({
    assignmentId: id,
    page,
    pageSize: PAGE_SIZE,
    filters: {},
  });

  if (error)
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  if (!assignment) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <Link
          href={routes.assignments.list}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary"
        >
          <ArrowRight className="size-4" aria-hidden />
          {ar.content.tabs.assignments}
        </Link>
        <h1 className="mt-1 flex flex-wrap items-center gap-2 font-display text-2xl font-bold text-ink">
          {assignment.title}
          <Badge>{t.kinds[assignment.kind] ?? assignment.kind}</Badge>
          <Badge tone={assignment.status.toLowerCase() === 'open' ? 'success' : 'neutral'} dot>
            {t.statuses[assignment.status] ?? assignment.status}
          </Badge>
        </h1>
        {assignment.description ? (
          <p className="mt-2 max-w-3xl whitespace-pre-line text-muted">{assignment.description}</p>
        ) : null}
        <p className="mt-2 text-sm text-muted">
          {t.dueAt}: {assignment.dueAt ? formatDateTime(assignment.dueAt) : '—'} · {t.maxScore}:{' '}
          {assignment.maxScore === null ? '—' : formatNumber(assignment.maxScore)}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-ink">{t.submissions}</h2>
        {submissions.error ? (
          <ErrorState title={ar.list.loadError} onRetry={() => void submissions.refetch()} />
        ) : submissions.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : submissions.data?.items.length ? (
          <ul className="flex flex-col gap-3">
            {submissions.data.items.map((submission) => (
              <li key={submission.id}>
                <SubmissionCard
                  submission={submission}
                  assignmentId={id}
                  maxScore={assignment.maxScore}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Inbox} title={t.submissionsEmpty} />
        )}
        {submissions.data && submissions.data.totalPages > 1 ? (
          <Pagination
            page={submissions.data.page}
            totalPages={submissions.data.totalPages}
            totalCount={submissions.data.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onPageSizeChange={() => undefined}
          />
        ) : null}
      </section>
    </div>
  );
}

function SubmissionCard({
  submission,
  assignmentId,
  maxScore,
}: {
  submission: SubmissionDto;
  assignmentId: string;
  maxScore: number | null;
}) {
  const [grade, grading] = useGradeSubmissionMutation();
  const [score, setScore] = useState(submission.score === null ? '' : String(submission.score));
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const scoreValue = score.trim() === '' ? null : Number(score);
  const invalid =
    scoreValue !== null &&
    (Number.isNaN(scoreValue) || scoreValue < 0 || (maxScore !== null && scoreValue > maxScore));

  const save = async () => {
    try {
      await grade({
        id: submission.id,
        assignmentId,
        score: scoreValue,
        feedback: feedback.trim() || null,
      }).unwrap();
      toast.success(t.graded, submission.studentName ?? undefined);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-ink">
          {submission.studentName ?? submission.studentId?.slice(0, 8) ?? '—'}
        </p>
        <p className="text-xs text-muted">
          {t.submittedAt}: {submission.submittedAt ? formatDateTime(submission.submittedAt) : '—'}
        </p>
      </div>
      {submission.note ? (
        <p className="rounded-md bg-canvas p-3 text-sm whitespace-pre-line text-ink">
          {submission.note}
        </p>
      ) : null}
      <Can
        permission="content.update"
        fallback={
          <p className="text-sm text-muted">
            {t.score}: {submission.score === null ? '—' : formatNumber(submission.score)}
          </p>
        }
      >
        <div className="grid items-end gap-3 sm:grid-cols-[8rem_1fr_auto]">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.score}
            <Input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              inputMode="decimal"
              dir="ltr"
              className="tabular"
              aria-invalid={invalid || undefined}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.feedback}
            <Input value={feedback} onChange={(event) => setFeedback(event.target.value)} />
          </label>
          <Button loading={grading.isLoading} disabled={invalid} onClick={() => void save()}>
            {t.grade}
          </Button>
        </div>
      </Can>
    </Card>
  );
}
