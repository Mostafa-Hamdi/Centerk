'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Check, MailQuestion, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatDate } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useDecideExcuseMutation, useGetExcusesQuery, type ExcuseDto } from '../historyApi';

const t = ar.excuses;
const STATUSES = ['Pending', 'Approved', 'Rejected'] as const;
const ALL = 'all';
const tones = { Pending: 'warning', Approved: 'success', Rejected: 'danger' } as const;

/** /attendance/excuses — guardian absence excuses: approve / reject pending ones. */
export function ExcusesPage() {
  const [status, setStatus] = useState<string>('Pending');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useGetExcusesQuery({
    status: status === ALL ? undefined : status,
    page,
  });
  const [decide] = useDecideExcuseMutation();

  const columns = useMemo<ColumnDef<ExcuseDto>[]>(() => {
    const run = async (excuse: ExcuseDto, approve: boolean) => {
      try {
        await decide({ id: excuse.id, approve }).unwrap();
        toast.success(approve ? t.approved : t.rejected);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      {
        id: 'student',
        header: t.student,
        cell: ({ row }) =>
          row.original.studentId ? (
            <Link
              href={routes.students.detail(row.original.studentId)}
              className="font-medium hover:text-primary"
            >
              {row.original.studentName ?? t.viewStudent}
            </Link>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'date',
        header: t.date,
        cell: ({ getValue }) => (getValue<string | null>() ? formatDate(getValue<string>()) : '—'),
      },
      {
        accessorKey: 'reason',
        header: t.reason,
        cell: ({ row }) => (
          <p className="max-w-md text-sm">
            {row.original.reason ?? '—'}
            {row.original.wantsMakeup ? <Badge className="ms-2">{t.makeup}</Badge> : null}
          </p>
        ),
      },
      {
        accessorKey: 'status',
        header: t.status,
        cell: ({ getValue }) => {
          const value = getValue<string>();
          const key = STATUSES.find((item) => item === value);
          return (
            <Badge tone={key ? tones[key] : 'neutral'} dot>
              {t.statuses[value] ?? value}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.status === 'Pending' ? (
            <Can permission="attendance.update">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<Check aria-hidden />}
                  onClick={() => void run(row.original, true)}
                >
                  {t.approve}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<X aria-hidden />}
                  onClick={() => void run(row.original, false)}
                >
                  {t.reject}
                </Button>
              </div>
            </Can>
          ) : null,
      },
    ];
  }, [decide]);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>
      <section className="list-panel">
        <div className="w-full max-w-xs">
          <Select
            aria-label={t.status}
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: ALL, label: t.all },
              ...STATUSES.map((value) => ({ value, label: t.statuses[value] ?? value })),
            ]}
          />
        </div>
        <DataTable
          startIndex={((data?.page ?? 1) - 1) * 20}
          caption={t.title}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={MailQuestion} title={t.empty} />}
        />
        {data && data.totalCount > 0 ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={20}
            onPageChange={setPage}
            onPageSizeChange={() => undefined}
          />
        ) : null}
      </section>
    </div>
  );
}
