'use client';

import { ArrowRight, Megaphone, Save } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { normalizeDigits } from '@/features/auth/schemas';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatNumber, formatPercent } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  gradeLevel,
  rankScores,
  useGetQuizQuery,
  usePublishQuizMutation,
  useSaveGradesMutation,
  type GradeLevel,
} from '../api';
import { QuizAnalyticsCard } from '@/features/extras/components/Cards';
import { MakeupsCard } from '@/features/extras/components/Tools';

const t = ar.quizzes;

const levelTone: Record<GradeLevel, 'success' | 'info' | 'primary' | 'warning' | 'danger'> = {
  excellent: 'success',
  veryGood: 'info',
  good: 'primary',
  pass: 'warning',
  weak: 'danger',
};

/** /quizzes/[id] — grade entry grid with live level/rank/stats, save (PUT grades) and publish. */
export function QuizGradesPage({ id }: { id: string }) {
  const { data: quiz, error, refetch } = useGetQuizQuery(id);
  const [saveGrades, saveState] = useSaveGradesMutation();
  const [publishQuiz] = usePublishQuizMutation();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => {
    if (quiz)
      setDraft(
        Object.fromEntries(
          quiz.grades.map((row) => [row.studentId, row.score === null ? '' : String(row.score)]),
        ),
      );
  }, [quiz]);

  const max = quiz?.maxScore ?? 0;
  const parsed = useMemo(
    () =>
      (quiz?.grades ?? []).map((row) => {
        const raw = normalizeDigits(draft[row.studentId] ?? '').trim();
        const score = raw === '' ? null : Number(raw);
        const invalid = score !== null && (!Number.isFinite(score) || score < 0 || score > max);
        return { ...row, score: invalid ? null : score, raw, invalid };
      }),
    [quiz, draft, max],
  );
  const ranks = rankScores(parsed.map((row) => row.score));
  const scored = parsed.filter((row) => row.score !== null);
  const avg = scored.length
    ? scored.reduce((sum, row) => sum + (row.score ?? 0), 0) / scored.length
    : null;
  const highest = scored.length ? Math.max(...scored.map((row) => row.score ?? 0)) : null;
  const passRate = scored.length
    ? scored.filter((row) => (row.score ?? 0) >= max / 2).length / scored.length
    : null;
  const dirty =
    Boolean(quiz) &&
    parsed.some(
      (row) =>
        row.score !== (quiz?.grades.find((g) => g.studentId === row.studentId)?.score ?? null) ||
        row.invalid,
    );
  const hasInvalid = parsed.some((row) => row.invalid);
  useUnsavedChangesGuard(dirty);

  if (error) return <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />;
  if (!quiz) return <Skeleton className="h-[32rem] rounded-xl" />;

  const save = async () => {
    if (hasInvalid) {
      toast.error(ar.validation.formErrorsTitle, t.grid.overMax(max));
      return;
    }
    try {
      await saveGrades({
        id,
        grades: parsed.map((row) => ({ studentId: row.studentId, score: row.score ?? undefined })),
      }).unwrap();
      toast.success(t.grid.saved, t.grid.graded + ': ' + formatNumber(scored.length));
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  const stats = [
    [t.average, avg === null ? '—' : `${formatNumber(Math.round(avg * 10) / 10)} ${t.maxOf(max)}`],
    [t.grid.highest, highest === null ? '—' : formatNumber(highest)],
    [t.grid.passRate, passRate === null ? '—' : formatPercent(passRate)],
    [t.grid.graded, `${formatNumber(scored.length)} / ${formatNumber(parsed.length)}`],
  ] as const;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card">
        <div className="flex items-start gap-3">
          <Link
            href={routes.quizzes.list}
            aria-label={ar.common.back}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line text-muted hover:border-primary hover:text-primary"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">{quiz.title}</h1>
              <Badge tone={quiz.status === 'Published' ? 'success' : 'neutral'} dot>
                {t.status[quiz.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {quiz.groupName ?? ''} · {t.maxOf(max)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="quizzes.update">
            <Button
              onClick={() => void save()}
              loading={saveState.isLoading}
              disabled={!dirty}
              iconStart={<Save aria-hidden />}
            >
              {t.grid.save}
            </Button>
          </Can>
          {quiz.status === 'Draft' ? (
            <Can permission="quizzes.publish">
              <Button
                variant="success"
                disabled={dirty || scored.length === 0}
                onClick={() => setPublishOpen(true)}
                iconStart={<Megaphone aria-hidden />}
              >
                {t.grid.publish}
              </Button>
            </Can>
          ) : null}
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-(--shell-gap) md:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label} className="p-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-ink tabular">{value}</dd>
          </Card>
        ))}
      </dl>

      {dirty ? (
        <p role="status" className="rounded-md bg-warning-tint px-4 py-2 text-sm text-warning">
          {t.grid.unsaved}
        </p>
      ) : null}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t.grid.student}
              </th>
              <th scope="col" className="w-36 px-4 py-3 text-start font-semibold">
                {t.grid.score}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t.grid.level}
              </th>
              <th scope="col" className="w-20 px-4 py-3 text-start font-semibold">
                {t.grid.rank}
              </th>
            </tr>
          </thead>
          <tbody>
            {parsed.map((row, index) => (
              <tr
                key={row.studentId}
                className="border-b border-line last:border-0 hover:bg-primary-tint/40"
              >
                <td className="px-4 py-2">
                  <span className="block font-medium text-ink">{row.studentName}</span>
                  <span dir="ltr" className="text-xs text-muted tabular">
                    {row.code}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <input
                    value={draft[row.studentId] ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [row.studentId]: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        document
                          .querySelectorAll<HTMLInputElement>('input[data-grade]')
                          [index + 1]?.focus();
                      } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        document
                          .querySelectorAll<HTMLInputElement>('input[data-grade]')
                          [index - 1]?.focus();
                      }
                    }}
                    data-grade
                    inputMode="decimal"
                    dir="ltr"
                    aria-label={`${t.grid.score} — ${row.studentName}`}
                    aria-invalid={row.invalid}
                    title={row.invalid ? t.grid.overMax(max) : undefined}
                    disabled={quiz.status === 'Published'}
                    className={cn(
                      'h-11 w-28 rounded-sm border border-line bg-surface px-3 text-center font-display text-base text-ink tabular focus:border-primary focus:ring-4 focus:ring-primary-tint focus:outline-none disabled:bg-canvas',
                      row.invalid && 'border-danger bg-danger-tint',
                    )}
                  />
                </td>
                <td className="px-4 py-2">
                  {row.score === null ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <Badge tone={levelTone[gradeLevel(row.score, max)]}>
                      {t.levels[gradeLevel(row.score, max)]}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2 font-display font-semibold text-ink tabular">
                  {ranks[index] ? formatNumber(ranks[index]) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        tone="warning"
        title={t.grid.publish}
        questionPrefix={t.grid.publishQuestion}
        itemName={quiz.title}
        description={t.grid.publishDesc}
        confirmLabel={t.grid.publish}
        onConfirm={async () => {
          try {
            await publishQuiz(id).unwrap();
            toast.success(t.grid.published, quiz.title);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
      <MakeupsCard
        quizId={id}
        maxScore={max}
        students={parsed.map((row) => ({ id: row.studentId, name: row.studentName }))}
      />
      <QuizAnalyticsCard quizId={id} />
    </div>
  );
}
