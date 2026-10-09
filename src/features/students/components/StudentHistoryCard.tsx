'use client';

import { useState } from 'react';
import { Pagination } from '@/components/data/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatNumber } from '@/lib/format';
import { useGetStudentAttendanceQuery, useGetStudentGradesQuery } from '../historyApi';

const t = ar.studentHistory;
const tones = { present: 'success', late: 'warning', absent: 'danger', excused: 'info' } as const;

/** Student profile: attendance and grades history tabs. */
export function StudentHistoryCard({ studentId }: { studentId: string }) {
  const [tab, setTab] = useState('attendance');
  const [attendancePage, setAttendancePage] = useState(1);
  const [gradesPage, setGradesPage] = useState(1);
  const attendance = useGetStudentAttendanceQuery({ studentId, page: attendancePage });
  const grades = useGetStudentGradesQuery(
    { studentId, page: gradesPage },
    { skip: tab !== 'grades' },
  );

  return (
    <Card className="flex flex-col gap-4 p-5">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList label={ar.students.title}>
          <TabsTrigger value="attendance">{t.attendance}</TabsTrigger>
          <TabsTrigger value="grades">{t.grades}</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          {attendance.isLoading ? (
            <Skeleton className="h-40 w-full rounded-md" />
          ) : attendance.data?.items.length ? (
            <ul className="flex flex-col divide-y divide-line">
              {attendance.data.items.map((row) => {
                const key = row.status.toLowerCase();
                return (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">
                        {row.date ? formatDateTime(row.date) : '—'}
                      </p>
                      <p className="text-xs text-muted">
                        {[row.groupName, row.topic].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>
                    <Badge tone={key in tones ? tones[key as keyof typeof tones] : 'neutral'} dot>
                      {ar.portal.attendanceStatus[row.status] ?? row.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">{t.noAttendance}</p>
          )}
          {attendance.data && attendance.data.totalPages > 1 ? (
            <Pagination
              page={attendance.data.page}
              totalPages={attendance.data.totalPages}
              totalCount={attendance.data.totalCount}
              pageSize={10}
              onPageChange={setAttendancePage}
              onPageSizeChange={() => undefined}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="grades">
          {grades.isLoading ? (
            <Skeleton className="h-40 w-full rounded-md" />
          ) : grades.data?.items.length ? (
            <ul className="flex flex-col divide-y divide-line">
              {grades.data.items.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{row.title}</p>
                    <p className="text-xs text-muted">{row.date ? formatDateTime(row.date) : ''}</p>
                  </div>
                  <span className="font-display text-base font-bold text-primary tabular">
                    {row.score === null ? '—' : formatNumber(row.score)}
                    {row.maxScore ? ` / ${formatNumber(row.maxScore)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">{t.noGrades}</p>
          )}
          {grades.data && grades.data.totalPages > 1 ? (
            <Pagination
              page={grades.data.page}
              totalPages={grades.data.totalPages}
              totalCount={grades.data.totalCount}
              pageSize={10}
              onPageChange={setGradesPage}
              onPageSizeChange={() => undefined}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
