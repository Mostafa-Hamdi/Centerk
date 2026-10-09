'use client';

import { UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetStudentsQuery } from '@/features/students/api';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { useEnrollStudentMutation, useGetGroupStudentsQuery } from '../api';

const t = ar.enrollment;

/** Group roster (GET /groups/{id}/students) + enroll a student (POST /students/{id}/enrollments). */
export function GroupStudentsCard({ groupId }: { groupId: string }) {
  const roster = useGetGroupStudentsQuery(groupId);
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState<string | undefined>();
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const [enroll, enrolling] = useEnrollStudentMutation();

  const submit = async () => {
    if (!studentId) return;
    try {
      await enroll({ studentId, groupId }).unwrap();
      toast.success(t.enrolled);
      setStudentId(undefined);
    } catch (caught) {
      const problem = toProblem(caught);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Users className="size-5 text-primary" aria-hidden />
          {t.students}
        </h2>
        {roster.data ? <Badge tone="primary">{t.count(roster.data.length)}</Badge> : null}
      </div>

      <Can permission="students.update">
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-canvas p-3">
          <div className="min-w-60 flex-1">
            <Combobox
              aria-label={t.enroll}
              value={studentId}
              onValueChange={setStudentId}
              onSearch={setSearch}
              loading={students.isFetching}
              placeholder={t.pick}
              options={(students.data?.items ?? []).map((student) => ({
                value: student.id,
                label: `${student.fullName} · ${student.code}`,
              }))}
            />
          </div>
          <Button
            iconStart={<UserPlus aria-hidden />}
            disabled={!studentId}
            loading={enrolling.isLoading}
            onClick={() => void submit()}
          >
            {t.enroll}
          </Button>
        </div>
      </Can>

      {roster.isLoading ? (
        <Skeleton className="h-32 w-full rounded-md" />
      ) : roster.data?.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {roster.data.map((student) => (
            <li key={student.id}>
              <Link
                href={routes.students.detail(student.id)}
                className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm transition-colors hover:border-primary hover:bg-primary-tint"
              >
                <span className="font-medium text-ink">{student.fullName}</span>
                <span dir="ltr" className="text-xs text-muted tabular">
                  {student.code ?? ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-sm text-muted">{t.empty}</p>
      )}
    </Card>
  );
}
