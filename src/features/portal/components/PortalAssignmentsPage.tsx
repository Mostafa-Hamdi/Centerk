'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useGetPortalAssignmentsQuery,
  useSubmitAssignmentMutation,
  type PortalAssignment,
} from '../api';

const t = ar.portal.assignments;

/** /portal/assignments — the student's homework: submit / update / withdraw, score + feedback. */
export function PortalAssignmentsPage() {
  const { data, error, refetch, isLoading } = useGetPortalAssignmentsQuery(undefined);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
      {error ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : data?.length ? (
        <ul className="flex flex-col gap-(--shell-gap)">
          {data.map((assignment) => (
            <li key={assignment.id}>
              <AssignmentCard assignment={assignment} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={FileText} title={t.empty} />
      )}
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: PortalAssignment }) {
  const [submit, submitting] = useSubmitAssignmentMutation();
  const [note, setNote] = useState(assignment.submission?.note ?? '');
  const open = assignment.status.toLowerCase() === 'open';
  const submitted = assignment.submission !== null;
  const graded =
    assignment.submission?.score !== null && assignment.submission?.score !== undefined;

  const run = async (mode: 'create' | 'update' | 'withdraw') => {
    try {
      await submit({ id: assignment.id, note: note.trim(), mode }).unwrap();
      toast.success(mode === 'withdraw' ? t.withdrawn : t.submitted, assignment.title);
      if (mode === 'withdraw') setNote('');
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-ink">{assignment.title}</h2>
        {open ? null : <Badge>{t.closed}</Badge>}
      </div>
      {assignment.description ? (
        <p className="text-sm whitespace-pre-line text-ink">{assignment.description}</p>
      ) : null}
      {assignment.dueAt ? (
        <p className="text-xs text-muted">{t.due(formatDateTime(assignment.dueAt))}</p>
      ) : null}

      {graded ? (
        <div className="rounded-md bg-success-tint/50 p-3 text-sm">
          <p className="font-bold text-success">
            {t.score(
              `${formatNumber(assignment.submission?.score ?? 0)}${
                assignment.maxScore ? ` / ${formatNumber(assignment.maxScore)}` : ''
              }`,
            )}
          </p>
          {assignment.submission?.feedback ? (
            <p className="mt-1 text-ink">
              {t.feedback}: {assignment.submission.feedback}
            </p>
          ) : null}
        </div>
      ) : null}

      {open && !graded ? (
        <>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.note}
            <Textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              loading={submitting.isLoading}
              disabled={!note.trim()}
              onClick={() => void run(submitted ? 'update' : 'create')}
            >
              {submitted ? t.update : t.submit}
            </Button>
            {submitted ? (
              <Button variant="ghost" onClick={() => void run('withdraw')}>
                {t.withdraw}
              </Button>
            ) : null}
          </div>
        </>
      ) : !graded && assignment.submission?.note ? (
        <p className="rounded-md bg-canvas p-3 text-sm whitespace-pre-line text-ink">
          {assignment.submission.note}
        </p>
      ) : null}
    </Card>
  );
}
