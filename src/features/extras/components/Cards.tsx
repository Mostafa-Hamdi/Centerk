'use client';

import { CalendarPlus, Check, Clock4, Percent, Trash2, Trophy, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery, useGetHallsQuery } from '@/features/groups/api';
import { useGetStudentsQuery } from '@/features/students/api';
import { ar } from '@/i18n/ar';
import { formatMoney, formatNumber, formatPercent } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  SESSION_KINDS,
  useCreateSessionMutation,
  useGetDiscountsQuery,
  useGetQuizAnalyticsQuery,
  useGetStudentDiscountsQuery,
  useGetWaitlistQuery,
  useStudentDiscountActionMutation,
  useWaitlistActionMutation,
  type SessionKind,
} from '../api';

const fail = (caught: unknown) => {
  const problem = toProblem(caught);
  toast.error(problem.title, problem.detail);
};

const heading = (icon: React.ReactNode, title: string) => (
  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
    {icon}
    {title}
  </h2>
);

/** Student profile: discounts applied to the student (assign / approve / remove). */
export function StudentDiscountsCard({ studentId }: { studentId: string }) {
  const t = ar.discounts;
  const catalogue = useGetDiscountsQuery(undefined);
  const assigned = useGetStudentDiscountsQuery(studentId);
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const [run, running] = useStudentDiscountActionMutation();
  const [discountId, setDiscountId] = useState<string | undefined>();
  const [groupId, setGroupId] = useState('all');
  const nameOf = (id: string | null) => catalogue.data?.find((discount) => discount.id === id);

  const act = async (arg: Parameters<typeof run>[0], done: string) => {
    try {
      await run(arg).unwrap();
      toast.success(done);
    } catch (caught) {
      fail(caught);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      {heading(<Percent className="size-5 text-primary" aria-hidden />, t.studentTitle)}
      <Can permission="students.update">
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-canvas p-3">
          <div className="min-w-48 flex-1">
            <Select
              aria-label={t.pick}
              value={discountId}
              onValueChange={setDiscountId}
              placeholder={t.pick}
              options={(catalogue.data ?? [])
                .filter((discount) => discount.isActive)
                .map((discount) => ({
                  value: discount.id,
                  label: `${discount.name} — ${discount.type === 'Percent' ? `${formatNumber(discount.value)}٪` : formatMoney(discount.value)}`,
                }))}
            />
          </div>
          <div className="min-w-44">
            <Select
              aria-label={t.group}
              value={groupId}
              onValueChange={setGroupId}
              options={[
                { value: 'all', label: t.allGroups },
                ...(groups.data?.items ?? []).map((group) => ({
                  value: group.id,
                  label: group.name,
                })),
              ]}
            />
          </div>
          <Button
            disabled={!discountId}
            loading={running.isLoading}
            onClick={() =>
              discountId
                ? void act(
                    {
                      studentId,
                      action: 'assign',
                      discountId,
                      groupId: groupId === 'all' ? undefined : groupId,
                    },
                    t.assigned,
                  )
                : undefined
            }
          >
            {t.assign}
          </Button>
        </div>
      </Can>
      {assigned.isLoading ? (
        <Skeleton className="h-16 w-full rounded-md" />
      ) : assigned.data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {assigned.data.map((item) => {
            const discount = nameOf(item.discountId);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <span className="flex items-center gap-2 font-medium text-ink">
                  {discount?.name ?? '—'}
                  <Badge
                    tone={item.approved || !discount?.requiresApproval ? 'success' : 'warning'}
                    dot
                  >
                    {item.approved || !discount?.requiresApproval ? t.active : t.pending}
                  </Badge>
                </span>
                <Can permission="students.update">
                  <span className="flex gap-1">
                    {!item.approved && discount?.requiresApproval ? (
                      <Button
                        size="sm"
                        variant="success"
                        iconStart={<Check aria-hidden />}
                        onClick={() =>
                          void act(
                            { studentId, action: 'approve', assignmentId: item.id },
                            t.approved,
                          )
                        }
                      >
                        {t.approve}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="neutral"
                      iconStart={<Trash2 aria-hidden />}
                      onClick={() =>
                        void act({ studentId, action: 'remove', assignmentId: item.id }, t.removed)
                      }
                    >
                      {t.remove}
                    </Button>
                  </span>
                </Can>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t.none}</p>
      )}
    </Card>
  );
}

/** Group details: waitlist (add a student / remove an entry). */
export function WaitlistCard({ groupId }: { groupId: string }) {
  const t = ar.waitlist;
  const waitlist = useGetWaitlistQuery(groupId);
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState<string | undefined>();
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const [run, running] = useWaitlistActionMutation();

  const add = async () => {
    if (!studentId) return;
    try {
      await run({ groupId, studentId }).unwrap();
      toast.success(t.added);
      setStudentId(undefined);
    } catch (caught) {
      fail(caught);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      {heading(<Clock4 className="size-5 text-warning" aria-hidden />, t.title)}
      <Can permission="students.update">
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-canvas p-3">
          <div className="min-w-60 flex-1">
            <Combobox
              aria-label={t.add}
              value={studentId}
              onValueChange={setStudentId}
              onSearch={setSearch}
              loading={students.isFetching}
              placeholder={ar.enrollment.pick}
              options={(students.data?.items ?? []).map((student) => ({
                value: student.id,
                label: `${student.fullName} · ${student.code}`,
              }))}
            />
          </div>
          <Button
            iconStart={<UserPlus aria-hidden />}
            disabled={!studentId}
            loading={running.isLoading}
            onClick={() => void add()}
          >
            {t.add}
          </Button>
        </div>
      </Can>
      {waitlist.data?.length ? (
        <ol className="flex flex-col divide-y divide-line">
          {waitlist.data.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="row-num tabular">{t.position(entry.position)}</span>
                <span className="font-medium text-ink">{entry.studentName}</span>
                <Badge>{t.statuses[entry.status] ?? entry.status}</Badge>
              </span>
              <Can permission="students.update">
                <Button
                  size="sm"
                  variant="neutral"
                  aria-label={`${ar.common.delete} ${entry.studentName}`}
                  iconStart={<Trash2 aria-hidden />}
                  onClick={async () => {
                    try {
                      await run({ groupId, entryId: entry.id }).unwrap();
                      toast.success(t.removed);
                    } catch (caught) {
                      fail(caught);
                    }
                  }}
                />
              </Can>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted">{t.empty}</p>
      )}
    </Card>
  );
}

/** Group details: one-off extra / review / makeup session (POST /sessions). */
export function ExtraSessionCard({ groupId }: { groupId: string }) {
  const t = ar.extraSession;
  const halls = useGetHallsQuery(undefined);
  const [create, creating] = useCreateSessionMutation();
  const [kind, setKind] = useState<SessionKind>('Extra');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState('120');
  const [topic, setTopic] = useState('');
  const [hallId, setHallId] = useState('none');
  const minutes = Number(duration);
  const valid = Boolean(startsAt) && Number.isInteger(minutes) && minutes >= 15 && minutes <= 600;

  const submit = async () => {
    if (!valid) return;
    try {
      await create({
        groupId,
        kind,
        startsAtUtc: new Date(startsAt).toISOString(),
        durationMinutes: minutes,
        topic: topic.trim() || undefined,
        hallId: hallId === 'none' ? undefined : hallId,
      }).unwrap();
      toast.success(t.created);
      setStartsAt('');
      setTopic('');
    } catch (caught) {
      fail(caught);
    }
  };

  return (
    <Can permission="sessions.manage">
      <Card className="flex flex-col gap-4 p-5">
        {heading(<CalendarPlus className="size-5 text-primary" aria-hidden />, t.title)}
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.kind}
            <Select
              value={kind}
              onValueChange={(value) => setKind(value as SessionKind)}
              options={SESSION_KINDS.map((value) => ({ value, label: t.kinds[value] ?? value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.startsAt}
            <Input
              type="datetime-local"
              dir="ltr"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.duration}
            <Input
              inputMode="numeric"
              dir="ltr"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.hall}
            <Select
              value={hallId}
              onValueChange={setHallId}
              options={[
                { value: 'none', label: t.noHall },
                ...(halls.data ?? []).map((hall) => ({ value: hall.id, label: hall.name })),
              ]}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.topic}
            <Input
              placeholder={t.topic}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </label>
          <Button disabled={!valid} loading={creating.isLoading} onClick={() => void submit()}>
            {t.create}
          </Button>
        </div>
      </Card>
    </Can>
  );
}

/** Quiz grades page: distribution bands + top students. */
export function QuizAnalyticsCard({ quizId }: { quizId: string }) {
  const t = ar.quizStats;
  const { data, isLoading } = useGetQuizAnalyticsQuery(quizId);
  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!data || data.gradedCount === 0)
    return <Card className="p-5 text-center text-sm text-muted">{t.empty}</Card>;

  const bands = [
    ['excellent', data.distribution.excellent, 'bg-success'],
    ['good', data.distribution.good, 'bg-primary'],
    ['pass', data.distribution.pass, 'bg-warning'],
    ['belowPass', data.distribution.belowPass, 'bg-danger'],
  ] as const;

  return (
    <Card className="grid gap-5 p-5 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        {heading(<Percent className="size-5 text-primary" aria-hidden />, t.title)}
        <p className="text-sm text-muted">
          {t.average}:{' '}
          <span className="font-display text-lg font-bold text-ink tabular">
            {data.average === null ? '—' : formatNumber(data.average)} /{' '}
            {formatNumber(data.maxScore)}
          </span>{' '}
          · {t.graded} {formatNumber(data.gradedCount)}
        </p>
        <ul className="flex flex-col gap-2">
          {bands.map(([key, count, color]) => (
            <li key={key} className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span className="text-ink">{t[key]}</span>
                <span className="text-muted tabular">
                  {formatNumber(count)} · {formatPercent(count / data.gradedCount)}
                </span>
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-canvas">
                <span
                  className={`block h-full rounded-full ${color}`}
                  style={{ width: `${(count / data.gradedCount) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        {heading(<Trophy className="size-5 text-warning" aria-hidden />, t.top)}
        <ol className="flex flex-col gap-2">
          {data.top.map((student) => (
            <li
              key={`${student.rank}-${student.name}`}
              className="flex items-center justify-between gap-2 rounded-md bg-canvas px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="row-num tabular">{formatNumber(student.rank)}</span>
                <span className="font-medium text-ink">{student.name}</span>
              </span>
              <span className="font-bold text-primary tabular">{formatNumber(student.score)}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
