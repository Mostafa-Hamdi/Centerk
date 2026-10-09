'use client';

import { format } from 'date-fns';
import { CalendarClock, Check, History, Pencil, Play, Plus, Trash2, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { ExportButton } from '@/components/data/ExportButton';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Dropdown,
  DropdownContent,
  DropdownLabel,
  DropdownTrigger,
} from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useCorrectAttendanceMutation,
  useGetClashesQuery,
  useGetExpenseCategoriesAdminQuery,
  useGetLessonsAdminQuery,
  useGetMakeupsQuery,
  useGetReportRunsQuery,
  useGetUnitsAdminQuery,
  useMakeupActionMutation,
  useResolveClashMutation,
  useRunReportNowMutation,
  useSaveCatalogItemMutation,
  type ClashDto,
  type CorrectableStatus,
  type MakeupDto,
  type NamedRow,
} from '../api2';

const t = ar.tools;
const STATUSES: readonly CorrectableStatus[] = ['Present', 'Late', 'Absent', 'Excused'];
const fail = (caught: unknown) => toast.error(toProblem(caught).title);

/** Attendance record: correct the status or delete it (both need a reason). */
export function RecordCorrection({ recordId, name }: { recordId: string; name: string }) {
  const [correct] = useCorrectAttendanceMutation();
  const [mode, setMode] = useState<'edit' | 'remove' | null>(null);
  const [status, setStatus] = useState<CorrectableStatus>('Present');
  return (
    <Can permission="attendance.update">
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${t.correct} ${name}`}
        iconStart={<Pencil aria-hidden />}
        onClick={() => setMode('edit')}
      />
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${ar.common.delete} ${name}`}
        iconStart={<Trash2 aria-hidden />}
        onClick={() => setMode('remove')}
      />
      <ConfirmDialog
        open={mode !== null}
        onOpenChange={(open) => {
          if (!open) setMode(null);
        }}
        title={mode === 'edit' ? t.correctTitle : t.removeRecord}
        questionPrefix={mode === 'edit' ? t.correctQuestion : ar.confirm.questionPrefix}
        itemName={name}
        description={
          mode === 'edit' ? (
            <span className="mt-3 flex flex-col gap-1 text-start text-sm font-medium text-ink">
              {t.newStatus}
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as CorrectableStatus)}
                options={STATUSES.map((value) => ({ value, label: t.statuses[value] ?? value }))}
              />
            </span>
          ) : (
            ''
          )
        }
        confirmLabel={mode === 'edit' ? t.correct : ar.common.delete}
        tone={mode === 'edit' ? 'warning' : 'danger'}
        requireReason
        onConfirm={async (reason) => {
          try {
            await correct(
              mode === 'edit'
                ? { recordId, status, reason: reason ?? '' }
                : { recordId, remove: true, reason: reason ?? '' },
            ).unwrap();
            toast.success(mode === 'edit' ? t.corrected : t.removed);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        }}
      />
    </Can>
  );
}

/** Quiz page: make-up exams (schedule for a student from the roster, record the result, cancel). */
export function MakeupsCard({
  quizId,
  students,
  maxScore,
}: {
  quizId: string;
  students: { id: string; name: string }[];
  maxScore: number;
}) {
  const { data } = useGetMakeupsQuery(quizId);
  const [run, running] = useMakeupActionMutation();
  const [studentId, setStudentId] = useState<string | undefined>();
  const [at, setAt] = useState('');
  const [completing, setCompleting] = useState<MakeupDto | null>(null);
  const [score, setScore] = useState('');
  const nameOf = (id: string | null) => students.find((student) => student.id === id)?.name ?? '—';
  const scoreValue = Number(score);
  const scoreValid = score.trim() !== '' && scoreValue >= 0 && scoreValue <= maxScore;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <CalendarClock className="size-5 text-warning" aria-hidden />
        {t.makeups}
      </h2>
      <Can permission="quizzes.update">
        <div className="flex flex-wrap items-end gap-2 rounded-md bg-canvas p-3">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm font-medium text-ink">
            {t.makeupStudent}
            <Select
              value={studentId}
              onValueChange={setStudentId}
              placeholder={t.makeupStudent}
              options={students.map((student) => ({ value: student.id, label: student.name }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.makeupAt}
            <Input
              type="datetime-local"
              dir="ltr"
              value={at}
              onChange={(event) => setAt(event.target.value)}
            />
          </label>
          <Button
            iconStart={<Plus aria-hidden />}
            disabled={!studentId || !at}
            loading={running.isLoading}
            onClick={async () => {
              if (!studentId) return;
              try {
                await run({
                  quizId,
                  action: 'schedule',
                  studentId,
                  scheduledAtUtc: new Date(at).toISOString(),
                }).unwrap();
                toast.success(t.scheduled);
                setStudentId(undefined);
                setAt('');
              } catch (caught) {
                fail(caught);
              }
            }}
          >
            {t.schedule}
          </Button>
        </div>
      </Can>
      {data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.map((makeup) => (
            <li
              key={makeup.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="font-medium text-ink">{nameOf(makeup.studentId)}</span>
                <span className="text-xs text-muted">
                  {makeup.scheduledAt ? formatDateTime(makeup.scheduledAt) : ''}
                </span>
                <Badge>{t.makeupStatuses[makeup.status] ?? makeup.status}</Badge>
              </span>
              {makeup.status === 'Scheduled' ? (
                <Can permission="quizzes.update">
                  <span className="flex gap-1">
                    <Button
                      size="sm"
                      variant="success"
                      iconStart={<Check aria-hidden />}
                      onClick={() => {
                        setCompleting(makeup);
                        setScore('');
                      }}
                    >
                      {t.complete}
                    </Button>
                    <Button
                      size="sm"
                      variant="neutral"
                      iconStart={<X aria-hidden />}
                      onClick={async () => {
                        try {
                          await run({ quizId, action: 'cancel', makeupId: makeup.id }).unwrap();
                          toast.success(t.cancelled);
                        } catch (caught) {
                          fail(caught);
                        }
                      }}
                    >
                      {t.cancelMakeup}
                    </Button>
                  </span>
                </Can>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t.noMakeups}</p>
      )}
      <ConfirmDialog
        open={completing !== null}
        onOpenChange={(open) => {
          if (!open) setCompleting(null);
        }}
        title={t.complete}
        questionPrefix={t.completeQuestion}
        itemName={completing ? nameOf(completing.studentId) : ''}
        description={
          <span className="mt-3 flex flex-col gap-1 text-start text-sm font-medium text-ink">
            {`${t.score} (≤ ${maxScore})`}
            <Input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              inputMode="decimal"
              dir="ltr"
              aria-invalid={(score !== '' && !scoreValid) || undefined}
            />
          </span>
        }
        confirmLabel={t.complete}
        tone="warning"
        requireReason
        onConfirm={async (reason) => {
          if (!completing || !scoreValid) return;
          try {
            await run({
              quizId,
              action: 'complete',
              makeupId: completing.id,
              score: scoreValue,
              reason: reason ?? '',
            }).unwrap();
            toast.success(t.completed);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        }}
      />
    </Card>
  );
}

/** Hall bookings page: clashes of a day; resolve by cancelling one side. */
export function ClashesCard() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data } = useGetClashesQuery(date);
  const [resolve] = useResolveClashMutation();
  const [pending, setPending] = useState<{ clash: ClashDto; bookingId: string } | null>(null);
  const label = (side: ClashDto['first']) =>
    `${t.kinds[side.kind] ?? side.kind} ${side.startsAt ? formatTime(side.startsAt) : ''}–${side.endsAt ? formatTime(side.endsAt) : ''}`;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Wrench className="size-5 text-danger" aria-hidden />
          {t.clashes}
        </h2>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          {t.clashDate}
          <Input
            type="date"
            dir="ltr"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
      </div>
      {data?.length ? (
        <ul className="flex flex-col gap-2">
          {data.map((clash) => (
            <li
              key={clash.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-danger/30 bg-danger-tint/40 p-3 text-sm"
            >
              <span className="text-ink">
                {label(clash.first)} ⇄ {label(clash.second)}
                {clash.reason ? (
                  <span className="block text-xs text-muted">{clash.reason}</span>
                ) : null}
              </span>
              <Can permission="centers.halls">
                <span className="flex gap-1">
                  <Button
                    size="sm"
                    variant="neutral"
                    onClick={() => setPending({ clash, bookingId: clash.first.id })}
                  >
                    {t.cancelFirst}
                  </Button>
                  <Button
                    size="sm"
                    variant="neutral"
                    onClick={() => setPending({ clash, bookingId: clash.second.id })}
                  >
                    {t.cancelSecond}
                  </Button>
                </span>
              </Can>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t.noClashes}</p>
      )}
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={t.clashes}
        questionPrefix={t.resolveQuestion}
        itemName={
          pending
            ? label(
                pending.bookingId === pending.clash.first.id
                  ? pending.clash.first
                  : pending.clash.second,
              )
            : ''
        }
        description=""
        confirmLabel={ar.common.confirm}
        tone="warning"
        requireReason
        onConfirm={async (reason) => {
          if (!pending) return;
          try {
            await resolve({
              id: pending.clash.id,
              date,
              bookingId: pending.bookingId,
              reason: reason ?? '',
            }).unwrap();
            toast.success(t.resolved);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        }}
      />
    </Card>
  );
}

/** Scheduled report row: run now + history with downloads. */
export function ReportRunsActions({ reportId }: { reportId: string }) {
  const [runNow, running] = useRunReportNowMutation();
  const [open, setOpen] = useState(false);
  const runs = useGetReportRunsQuery(reportId, { skip: !open });
  return (
    <span className="inline-flex gap-1">
      <Can permission="reports.schedule">
        <Button
          size="sm"
          variant="ghost"
          aria-label={t.runNow}
          iconStart={<Play aria-hidden />}
          loading={running.isLoading}
          onClick={async () => {
            try {
              await runNow(reportId).unwrap();
              toast.success(t.ran);
            } catch (caught) {
              fail(caught);
            }
          }}
        />
      </Can>
      <Dropdown onOpenChange={setOpen}>
        <DropdownTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t.runs}
            iconStart={<History aria-hidden />}
          />
        </DropdownTrigger>
        <DropdownContent className="w-80">
          <DropdownLabel>{t.runs}</DropdownLabel>
          <span className="flex flex-col gap-2 p-2">
            {runs.data?.items.length ? (
              runs.data.items.map((run) => (
                <span key={run.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-ink">
                    {run.generatedAt ? formatDateTime(run.generatedAt) : '—'}
                    <Badge className="ms-1" tone={run.delivered ? 'success' : 'neutral'}>
                      {run.delivered ? t.delivered : t.notDelivered}
                    </Badge>
                  </span>
                  <ExportButton
                    path={`/report-runs/${encodeURIComponent(run.id)}/export`}
                    params={{}}
                    fileName={`report-${run.id.slice(0, 8)}`}
                    extension="pdf"
                    label={t.download}
                  />
                </span>
              ))
            ) : (
              <span className="text-xs text-muted">{t.noRuns}</span>
            )}
          </span>
        </DropdownContent>
      </Dropdown>
    </span>
  );
}

/** Small catalogue manager (name list + add / rename / delete) used for categories, units, lessons. */
function CatalogList({
  title,
  rows,
  resource,
  extraBody,
  parent,
}: {
  title: string;
  rows: NamedRow[];
  resource: 'expense-categories' | 'units' | 'lessons';
  extraBody?: Record<string, unknown>;
  parent?: React.ReactNode;
}) {
  const [save, saving] = useSaveCatalogItemMutation();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<NamedRow | null>(null);

  const submit = async () => {
    const value = name.trim();
    if (value.length < 2) return;
    try {
      await save({
        resource,
        id: editing?.id,
        body: { name: value, isActive: true, ...(editing ? {} : extraBody) },
      }).unwrap();
      toast.success(t.saved, value);
      setName('');
      setEditing(null);
    } catch (caught) {
      fail(caught);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">{title}</h3>
        <ExportButton path={`/${resource}/export`} params={{}} fileName={resource} />
      </div>
      {parent}
      <div className="flex gap-2">
        <Input
          value={name}
          placeholder={t.namePlaceholder}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          loading={saving.isLoading}
          disabled={name.trim().length < 2}
          onClick={() => void submit()}
        >
          {editing ? ar.common.save : t.add}
        </Button>
      </div>
      <ul className="flex max-h-64 flex-col divide-y divide-line overflow-y-auto">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span className={row.isActive ? 'text-ink' : 'text-muted line-through'}>
              {row.name}
            </span>
            <span className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${t.rename} ${row.name}`}
                iconStart={<Pencil aria-hidden />}
                onClick={() => {
                  setEditing(row);
                  setName(row.name);
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.delete} ${row.name}`}
                iconStart={<Trash2 aria-hidden />}
                onClick={async () => {
                  try {
                    await save({ resource, id: row.id, body: {}, remove: true }).unwrap();
                    toast.success(t.deleted, row.name);
                  } catch (caught) {
                    fail(caught);
                  }
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExpenseCategoriesCard() {
  const { data } = useGetExpenseCategoriesAdminQuery(undefined);
  return (
    <Can permission="cash.update">
      <Card className="p-5">
        <CatalogList title={t.categories} rows={data ?? []} resource="expense-categories" />
      </Card>
    </Can>
  );
}

export function CurriculumCard() {
  const units = useGetUnitsAdminQuery(undefined);
  const lessons = useGetLessonsAdminQuery(undefined);
  const [unitId, setUnitId] = useState<string | undefined>();
  return (
    <Card className="grid gap-6 p-5 lg:grid-cols-2">
      <CatalogList title={t.units} rows={units.data ?? []} resource="units" />
      <CatalogList
        title={t.lessons}
        rows={(lessons.data ?? []).filter((lesson) => !unitId || lesson.parentId === unitId)}
        resource="lessons"
        extraBody={unitId ? { unitId } : undefined}
        parent={
          <Select
            aria-label={t.unit}
            value={unitId}
            onValueChange={setUnitId}
            placeholder={t.pickUnit}
            options={(units.data ?? []).map((unit) => ({ value: unit.id, label: unit.name }))}
          />
        }
      />
    </Card>
  );
}
