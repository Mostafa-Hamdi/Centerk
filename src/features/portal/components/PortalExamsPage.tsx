'use client';

import { FileQuestion, Play, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { formatDateTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetPortalExamsQuery, useStartAttemptMutation, type PortalExam } from '../api';

const t = ar.portal.exams;

/** /portal/exams — open online exams; starting one (or resuming) opens the attempt screen. */
export function PortalExamsPage() {
  const router = useRouter();
  const { data, error, refetch, isLoading } = useGetPortalExamsQuery(undefined);
  const [start] = useStartAttemptMutation();
  const [starting, setStarting] = useState<PortalExam | null>(null);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
      {error ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : data?.length ? (
        <ul className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-3">
          {data.map((exam) => (
            <li key={exam.id}>
              <Card className="flex h-full flex-col gap-3 p-5">
                <h2 className="font-display text-lg font-bold text-ink">{exam.title}</h2>
                <p className="text-sm text-muted">
                  {t.window(
                    exam.opensAt ? formatDateTime(exam.opensAt) : '—',
                    exam.closesAt ? formatDateTime(exam.closesAt) : '—',
                  )}
                </p>
                <p className="flex items-center gap-2 text-sm text-ink">
                  <Timer className="size-4 text-muted" aria-hidden />
                  {ar.onlineExams.minutes(exam.durationMinutes)}
                </p>
                <Button
                  className="mt-auto"
                  iconStart={<Play aria-hidden />}
                  onClick={() => setStarting(exam)}
                >
                  {t.start}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={FileQuestion} title={t.empty} />
      )}

      <ConfirmDialog
        open={starting !== null}
        onOpenChange={(open) => {
          if (!open) setStarting(null);
        }}
        title={t.start}
        questionPrefix={t.startQuestion}
        itemName={starting?.title ?? ''}
        description={t.startDesc}
        confirmLabel={t.start}
        tone="warning"
        onConfirm={async () => {
          if (!starting) return;
          try {
            const attempt = await start(starting.id).unwrap();
            router.push(routes.portal.attempt(attempt.id));
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
