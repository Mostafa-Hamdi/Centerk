'use client';

import { CheckCircle2, Flag, Send, Timer, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useGetAttemptQuery,
  useGetAttemptReviewQuery,
  useSaveAnswerMutation,
  useSubmitAttemptMutation,
  type Attempt,
  type AttemptAnswer,
  type AttemptQuestion,
} from '../api';

const t = ar.portal.exams;
const TRUE_FALSE = [
  { label: 'True', text: ar.questions.form.true },
  { label: 'False', text: ar.questions.form.false },
];

const isFinished = (attempt: Attempt) => !/progress|started|open/i.test(attempt.status);

/** /portal/exams/attempts/[id] — exam taking (timer, autosaved answers, submit) or the review. */
export function AttemptPage({ id }: { id: string }) {
  const { data: attempt, error, refetch } = useGetAttemptQuery(id);

  if (error)
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  if (!attempt) return <Skeleton className="h-96 w-full rounded-xl" />;
  return isFinished(attempt) ? <AttemptReview id={id} /> : <AttemptForm attempt={attempt} />;
}

function useCountdown(expiresAt: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!expiresAt) return null;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
}

function AttemptForm({ attempt }: { attempt: Attempt }) {
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>(() =>
    Object.fromEntries(attempt.answers.map((answer) => [answer.questionId, answer])),
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState(false);
  const [saveAnswer] = useSaveAnswerMutation();
  const [submit] = useSubmitAttemptMutation();
  const essayTimers = useRef<Record<string, number>>({});
  const secondsLeft = useCountdown(attempt.expiresAt);
  const autoSubmitted = useRef(false);

  const persist = async (answer: AttemptAnswer) => {
    setSaving((current) => ({ ...current, [answer.questionId]: true }));
    try {
      await saveAnswer({
        attemptId: attempt.id,
        questionId: answer.questionId,
        selectedLabel: answer.selectedLabel,
        essayText: answer.essayText,
        isFlagged: answer.isFlagged,
      }).unwrap();
    } catch (caught) {
      toast.error(toProblem(caught).title);
    } finally {
      setSaving((current) => ({ ...current, [answer.questionId]: false }));
    }
  };

  const update = (questionId: string, patch: Partial<AttemptAnswer>, debounce = false) => {
    const next: AttemptAnswer = {
      questionId,
      selectedLabel: null,
      essayText: null,
      isFlagged: false,
      pointsAwarded: null,
      ...answers[questionId],
      ...patch,
    };
    setAnswers((current) => ({ ...current, [questionId]: next }));
    window.clearTimeout(essayTimers.current[questionId]);
    if (debounce) {
      essayTimers.current[questionId] = window.setTimeout(() => void persist(next), 800);
    } else {
      void persist(next);
    }
  };

  const finish = async () => {
    try {
      await submit(attempt.id).unwrap();
      toast.success(t.submitted);
    } catch (caught) {
      toast.error(toProblem(caught).title);
      throw caught;
    }
  };

  // The server closes expired attempts; submit once on our side too so the review shows.
  useEffect(() => {
    if (secondsLeft === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      toast.info(t.expired);
      void finish().catch(() => undefined);
    }
  });

  const answered = attempt.questions.filter((question) => {
    const answer = answers[question.id];
    return Boolean(answer?.selectedLabel ?? answer?.essayText?.trim());
  }).length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-(--shell-gap)">
      <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/90 p-3 shadow-card backdrop-blur">
        <span className="text-sm text-muted">{t.answered(answered, attempt.questions.length)}</span>
        {secondsLeft !== null ? (
          <span
            role="timer"
            aria-label={t.timeLeft}
            className={cn(
              'flex items-center gap-2 font-display text-lg font-bold tabular',
              secondsLeft < 60 ? 'text-danger' : 'text-ink',
            )}
          >
            <Timer className="size-5" aria-hidden />
            {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </span>
        ) : null}
        <Button
          variant="success"
          iconStart={<Send aria-hidden />}
          onClick={() => setConfirming(true)}
        >
          {t.submit}
        </Button>
      </div>

      {attempt.questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          index={index}
          total={attempt.questions.length}
          question={question}
          answer={answers[question.id]}
          saving={saving[question.id] ?? false}
          onChange={(patch, debounce) => update(question.id, patch, debounce)}
        />
      ))}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t.submit}
        questionPrefix={t.submitQuestion}
        itemName={t.answered(answered, attempt.questions.length)}
        description={t.submitDesc}
        confirmLabel={t.submit}
        tone="warning"
        onConfirm={finish}
      />
    </div>
  );
}

function QuestionCard({
  index,
  total,
  question,
  answer,
  saving,
  onChange,
}: {
  index: number;
  total: number;
  question: AttemptQuestion;
  answer: AttemptAnswer | undefined;
  saving: boolean;
  onChange: (patch: Partial<AttemptAnswer>, debounce?: boolean) => void;
}) {
  const options =
    question.type === 'TrueFalse' && !question.options.length ? TRUE_FALSE : question.options;
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>{t.question(index + 1, total)}</span>
        <span className="flex items-center gap-2">
          {saving ? t.saving : answer ? t.saved : null}
          <Badge>{t.points(question.points)}</Badge>
        </span>
      </div>
      <p className="font-medium whitespace-pre-line text-ink">{question.text}</p>
      {question.type === 'Essay' ? (
        <Textarea
          rows={5}
          placeholder={t.essayPlaceholder}
          value={answer?.essayText ?? ''}
          onChange={(event) => onChange({ essayText: event.target.value }, true)}
          aria-label={t.question(index + 1, total)}
        />
      ) : (
        <div
          role="radiogroup"
          aria-label={t.question(index + 1, total)}
          className="flex flex-col gap-2"
        >
          {options.map((option) => {
            const checked = answer?.selectedLabel === option.label;
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onChange({ selectedLabel: option.label })}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-start text-sm transition-colors',
                  checked
                    ? 'border-primary bg-primary-tint text-primary'
                    : 'border-line text-ink hover:border-primary/50',
                )}
              >
                <span
                  dir="ltr"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-bold"
                >
                  {option.label.slice(0, 1)}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>
      )}
      <div>
        <Button
          size="sm"
          variant={answer?.isFlagged ? 'warning' : 'ghost'}
          iconStart={<Flag aria-hidden />}
          aria-pressed={answer?.isFlagged ?? false}
          onClick={() => onChange({ isFlagged: !answer?.isFlagged })}
        >
          {t.flag}
        </Button>
      </div>
    </Card>
  );
}

function AttemptReview({ id }: { id: string }) {
  const { data: review, error, refetch } = useGetAttemptReviewQuery(id);

  if (error) return <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />;
  if (!review) return <Skeleton className="h-96 w-full rounded-xl" />;

  const total = review.questions.reduce((sum, question) => sum + question.points, 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-(--shell-gap)">
      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">{t.review}</h1>
        <p className="font-display text-4xl font-bold text-primary tabular">
          {review.score === null
            ? t.pendingGrade
            : `${formatNumber(review.score)} / ${formatNumber(total)}`}
        </p>
      </Card>
      {review.questions.map((question, index) => {
        const answer = review.answers.find((item) => item.questionId === question.id);
        const options =
          question.type === 'TrueFalse' && !question.options.length ? TRUE_FALSE : question.options;
        const label = (value: string | null) =>
          options.find((option) => option.label === value)?.text ?? value ?? '—';
        const correct =
          question.type !== 'Essay' && answer?.selectedLabel === question.correctLabel;
        return (
          <Card key={question.id} className="flex flex-col gap-2 p-5">
            <div className="flex items-center justify-between gap-2 text-sm text-muted">
              <span>{t.question(index + 1, review.questions.length)}</span>
              {question.type === 'Essay' ? (
                <Badge>
                  {answer?.pointsAwarded === null || answer?.pointsAwarded === undefined
                    ? t.pendingGrade
                    : `${formatNumber(answer.pointsAwarded)} / ${formatNumber(question.points)}`}
                </Badge>
              ) : correct ? (
                <CheckCircle2 className="size-5 text-success" aria-label={t.correct} />
              ) : (
                <XCircle className="size-5 text-danger" aria-hidden />
              )}
            </div>
            <p className="font-medium whitespace-pre-line text-ink">{question.text}</p>
            <p className="text-sm">
              <span className="text-muted">{t.yourAnswer}: </span>
              {question.type === 'Essay'
                ? (answer?.essayText ?? '—')
                : label(answer?.selectedLabel ?? null)}
            </p>
            {question.type !== 'Essay' && !correct && question.correctLabel ? (
              <p className="text-sm text-success">
                {t.correct}: {label(question.correctLabel)}
              </p>
            ) : null}
            {question.explanation ? (
              <p className="rounded-md bg-canvas p-3 text-sm text-muted">{question.explanation}</p>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
