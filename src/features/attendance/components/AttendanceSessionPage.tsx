'use client';

import { m } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Info,
  Lock,
  ScanLine,
  ShieldAlert,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, type SyntheticEvent } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatMoney, formatNumber, formatTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useCloseAttendanceSessionMutation,
  useGetSessionAttendanceQuery,
  useMarkAttendanceMutation,
  useScanAttendanceMutation,
  type AttendanceStatus,
  type ScanResult,
} from '../api';

const t = ar.attendance;

/** green = present · amber = late / dues · red = refused · blue = already recorded */
const panel: Record<ScanResult['tone'], { box: string; icon: typeof CheckCircle2 }> = {
  success: { box: 'border-success bg-success-tint text-success', icon: CheckCircle2 },
  warning: { box: 'border-warning bg-warning-tint text-warning', icon: TriangleAlert },
  danger: { box: 'border-danger bg-danger-tint text-danger', icon: XCircle },
  info: { box: 'border-cyan-deep bg-info-tint text-info', icon: Info },
};

const statusTone: Record<AttendanceStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  Present: 'success',
  Late: 'warning',
  Absent: 'danger',
  Excused: 'info',
};

/** Long scanner payloads are QR tokens; short ones are typed student codes. */
const isQrToken = (value: string) => value.length > 20;

/** /attendance/[sessionId] — scan screen (keyboard-wedge QR scanners), roster and close. */
export function AttendanceSessionPage({ sessionId }: { sessionId: string }) {
  const { data, isLoading, error, refetch } = useGetSessionAttendanceQuery(sessionId);
  const [scan, scanState] = useScanAttendanceMutation();
  const [mark] = useMarkAttendanceMutation();
  const [closeSession] = useCloseAttendanceSessionMutation();
  const [value, setValue] = useState('');
  const [result, setResult] = useState<(ScanResult & { message: string; key: number }) | null>(
    null,
  );
  const [blockedCode, setBlockedCode] = useState<{ code: string; name: string } | null>(null);
  const [closing, setClosing] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitScan = async (raw: string, override?: { reason: string }) => {
    const input = raw.trim();
    if (!input) return;
    try {
      const res = await scan({
        sessionId,
        ...(isQrToken(input) ? { qrToken: input } : { code: input }),
        ...(override ? { override: true, overrideReason: override.reason } : {}),
      }).unwrap();
      const message =
        res.outcome === 'already'
          ? t.outcome.already
          : res.outcome === 'late'
            ? t.outcome.late
            : res.balance
              ? t.debt(formatMoney(res.balance))
              : t.outcome.present;
      setResult({ ...res, message, key: Date.now() });
    } catch (caught) {
      const problem = toProblem(caught);
      const name =
        typeof problem.data === 'object' && problem.data && 'studentName' in problem.data
          ? String(problem.data.studentName)
          : null;
      setResult({
        tone: 'danger',
        studentName: name,
        outcome: 'error',
        balance: null,
        blocked: problem.code === 'student-blocked',
        message: problem.title,
        key: Date.now(),
      });
      if (problem.code === 'student-blocked') setBlockedCode({ code: input, name: name ?? input });
    } finally {
      setValue('');
      inputRef.current?.focus();
    }
  };

  const onSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    void submitScan(value);
  };

  const markStudent = async (studentId: string, name: string, status: AttendanceStatus) => {
    try {
      await mark({ sessionId, studentId, status, reason: t.manualReason }).unwrap();
      toast.success(t.marked(name, t.mark[status]));
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  if (error) {
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  }
  if (isLoading || !data) return <Skeleton className="h-[36rem] rounded-xl" />;

  const { counters } = data;
  const remaining = data.notRecorded.length;
  const Icon = result ? panel[result.tone].icon : ScanLine;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card">
        <div className="flex items-start gap-3">
          <Link
            href={routes.attendance.list}
            aria-label={ar.common.back}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line text-muted hover:border-primary hover:text-primary"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {data.groupName || t.title}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {data.startsAt ? formatTime(data.startsAt) : null}
              {data.closed ? (
                <Badge tone="neutral" className="ms-2">
                  <Lock aria-hidden /> {t.sessionClosed}
                </Badge>
              ) : null}
            </p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label={t.roster}>
          {(
            [
              ['success', t.counters.present, counters.present],
              ['warning', t.counters.late, counters.late],
              ['danger', t.counters.absent, counters.absent],
              ['primary', t.counters.remaining, remaining],
            ] as const
          ).map(([tone, label, count]) => (
            <li key={label}>
              <Badge tone={tone} className="px-3 py-1.5 text-sm">
                {label} <span className="font-display tabular">{formatNumber(count)}</span>
              </Badge>
            </li>
          ))}
        </ul>
      </header>

      {data.closed ? null : (
        <section className="grid gap-(--shell-gap) lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="flex flex-col gap-4">
            <form onSubmit={onSubmit} className="flex flex-col gap-2">
              <label htmlFor="scan-input" className="font-display font-semibold text-ink">
                {t.scanLabel}
              </label>
              <Input
                id="scan-input"
                ref={inputRef}
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={t.scanPlaceholder}
                autoComplete="off"
                dir="ltr"
                className="h-16 text-center font-display text-2xl tracking-widest"
                startAdornment={<ScanLine aria-hidden />}
                disabled={scanState.isLoading}
              />
            </form>
            <Can permission="attendance.closeSession">
              <Button
                variant="primary"
                className="self-start"
                onClick={() => setClosing(true)}
                iconStart={<Lock aria-hidden />}
              >
                {t.close}
              </Button>
            </Can>
          </Card>

          <div aria-live="assertive" className="min-h-48">
            {/* Result must show instantly (no exit wait): keyed remount + light pop-in that is readable from frame 0. */}
            <m.div
              key={result?.key ?? 'idle'}
              initial={{ opacity: 0.7, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className={cn(
                'flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-xl border-2 p-6 text-center',
                result ? panel[result.tone].box : 'border-dashed border-line bg-canvas text-muted',
              )}
            >
              <Icon className="size-12" aria-hidden />
              <p className="font-display text-2xl font-bold">
                {result?.studentName ?? (result ? '' : t.scanLabel)}
              </p>
              {result ? <p className="text-lg font-medium">{result.message}</p> : null}
              {result?.blocked && blockedCode ? (
                <Can permission="attendance.overrideBlock">
                  <Button
                    variant="warning"
                    size="sm"
                    iconStart={<ShieldAlert aria-hidden />}
                    onClick={() => setOverrideOpen(true)}
                  >
                    {t.override}
                  </Button>
                </Can>
              ) : null}
            </m.div>
          </div>
        </section>
      )}

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-ink">{t.roster}</h2>
        <div className="grid gap-(--shell-gap) lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted">
              {t.notRecorded} ({formatNumber(remaining)})
            </h3>
            {remaining ? (
              <ul className="flex flex-col gap-2">
                {data.notRecorded.map((student) => (
                  <li
                    key={student.studentId}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-line p-3 transition-colors hover:bg-primary-tint/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {student.fullName}
                      </span>
                      <span dir="ltr" className="text-xs text-muted tabular">
                        {student.code}
                      </span>
                    </span>
                    {student.blocked ? <Badge tone="danger">موقوف</Badge> : null}
                    {student.balance > 0 ? (
                      <Badge tone="warning">{formatMoney(student.balance)}</Badge>
                    ) : null}
                    <Can permission="attendance.create">
                      <div className="flex gap-1">
                        {(['Present', 'Late', 'Absent'] as const).map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={
                              status === 'Present'
                                ? 'success'
                                : status === 'Late'
                                  ? 'warning'
                                  : 'neutral'
                            }
                            onClick={() =>
                              void markStudent(student.studentId, student.fullName, status)
                            }
                          >
                            {t.mark[status]}
                          </Button>
                        ))}
                      </div>
                    </Can>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-md bg-success-tint p-4 text-center text-sm text-success">
                {t.allRecorded}
              </p>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted">
              {t.recorded} ({formatNumber(data.records.length)})
            </h3>
            <ul className="flex flex-col gap-2">
              {data.records.map((record) => (
                <li
                  key={record.id}
                  className="flex items-center gap-2 rounded-md border border-line p-3"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {record.studentName}
                  </span>
                  {record.checkedInAt ? (
                    <span className="text-xs text-muted tabular">
                      {formatTime(record.checkedInAt)}
                    </span>
                  ) : null}
                  <Badge tone={statusTone[record.status]} dot>
                    {t.mark[record.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={closing}
        onOpenChange={setClosing}
        tone="warning"
        title={t.close}
        questionPrefix={t.closeQuestion}
        itemName={data.groupName || t.title}
        description={t.closeDesc}
        confirmLabel={t.close}
        onConfirm={async () => {
          try {
            await closeSession({ sessionId, notifyAbsent: true }).unwrap();
            toast.success(t.closed);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
      <ConfirmDialog
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        tone="warning"
        title={t.override}
        questionPrefix={t.overrideQuestion}
        itemName={blockedCode?.name ?? ''}
        description={t.overrideDesc}
        confirmLabel={t.override}
        requireReason
        onConfirm={async (reason) => {
          if (blockedCode) await submitScan(blockedCode.code, { reason: reason ?? '' });
        }}
      />
    </div>
  );
}
