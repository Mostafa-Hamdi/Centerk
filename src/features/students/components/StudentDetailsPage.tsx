'use client';

import { ArrowRight, Pencil, Percent, Star, Trash2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatMoney, formatNumber, formatPercent, formatPhone } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useDeleteStudentMutation, useGetStudentQuery } from '../api';

const t = ar.students;

/** Known Swagger relations get an Arabic label; anything else is shown as sent. */
const relationLabel = (relation: string) =>
  relation in t.relations ? t.relations[relation as keyof typeof t.relations] : relation;

/** /students/[id] — 360 profile: contact, guardians, attendance, grades, balance. */
export function StudentDetailsPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: student, isLoading, error, refetch } = useGetStudentQuery(id);
  const [deleteStudent] = useDeleteStudentMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (error) {
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  }
  if (isLoading || !student) {
    return (
      <div className="flex flex-col gap-(--shell-gap)">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid gap-(--shell-gap) md:grid-cols-3">
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
        </div>
      </div>
    );
  }

  const archive = async () => {
    try {
      await deleteStudent(id).unwrap();
      toast.success(t.deleted, student.fullName);
      router.replace(routes.students.list);
    } catch (caught) {
      toast.error(toProblem(caught).title);
      throw caught;
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <div className="flex items-start gap-3">
          <Link
            href={routes.students.list}
            aria-label={ar.common.back}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line text-muted hover:border-primary hover:text-primary"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">{student.fullName}</h1>
              <Badge tone={student.status === 'Active' ? 'success' : 'warning'} dot>
                {t.status[student.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {t.details.code}:{' '}
              <span dir="ltr" className="tabular">
                {student.code}
              </span>
              {student.grade ? ` · ${student.grade}` : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="students.update">
            <Link
              href={routes.students.edit(id)}
              className={buttonVariants({ variant: 'neutral' })}
            >
              <Pencil className="size-4" aria-hidden />
              {ar.common.edit}
            </Link>
          </Can>
          <Can permission="students.delete">
            <Button
              variant="danger"
              iconStart={<Trash2 aria-hidden />}
              onClick={() => setConfirmOpen(true)}
            >
              {t.archive}
            </Button>
          </Can>
        </div>
      </header>

      <div className="grid gap-(--shell-gap) md:grid-cols-3">
        <StatCard
          label={t.details.attendance}
          value={student.attendanceRate === null ? '—' : formatPercent(student.attendanceRate)}
          icon={Percent}
          tone="cyan"
        />
        <StatCard
          label={t.details.average}
          value={student.averageGrade === null ? '—' : formatNumber(student.averageGrade)}
          icon={Star}
        />
        <StatCard
          label={t.details.balance}
          value={formatMoney(student.balance)}
          icon={Wallet}
          tone={student.balance > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid gap-(--shell-gap) md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">{t.details.contact}</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t.columns.phone}</dt>
              <dd dir="ltr" className="tabular">
                {student.phone ? formatPhone(student.phone) : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t.columns.grade}</dt>
              <dd>{student.grade ?? '—'}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            {t.details.guardians}
          </h2>
          <ul className="flex flex-col gap-3">
            {student.guardians.map((guardian) => (
              <li key={guardian.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium text-ink">{guardian.fullName}</span>
                  <span className="text-muted"> · {relationLabel(guardian.relation)}</span>
                </span>
                <span dir="ltr" className="text-muted tabular">
                  {formatPhone(guardian.phone)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.archive}
        itemName={student.fullName}
        description={t.deleteDesc}
        confirmLabel={t.archive}
        onConfirm={archive}
      />
    </div>
  );
}
