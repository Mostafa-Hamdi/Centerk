'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, BellRing, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatPhone } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetAlertStudentsQuery, useNotifyAlertMutation, type AlertStudentDto } from '../api';

const t = ar.alertDrill;

/** /dashboard/alerts/[type] — students behind a dashboard alert + notify their guardians. */
export function AlertStudentsPage({ type }: { type: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useGetAlertStudentsQuery({ type, page });
  const [notify] = useNotifyAlertMutation();
  const [confirming, setConfirming] = useState(false);
  const label = (ar.dashboard.alerts as Record<string, string | undefined>)[type] ?? type;

  const columns = useMemo<ColumnDef<AlertStudentDto>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: ar.students.columns.student,
        cell: ({ row }) => (
          <Link
            href={routes.students.detail(row.original.id)}
            className="font-medium hover:text-primary"
          >
            {row.original.fullName}
          </Link>
        ),
      },
      {
        accessorKey: 'code',
        header: ar.studentImport.fields.code,
        cell: ({ getValue }) => (
          <span dir="ltr" className="tabular">
            {getValue<string | null>() ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: ar.students.columns.phone,
        cell: ({ getValue }) =>
          getValue<string | null>() ? (
            <span dir="ltr" className="tabular">
              {formatPhone(getValue<string>())}
            </span>
          ) : (
            '—'
          ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href={routes.dashboard}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary"
          >
            <ArrowRight className="size-4" aria-hidden />
            {ar.nav.dashboard}
          </Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 font-display text-2xl font-bold text-ink">
            {t.title(label)}
            {data ? <Badge tone="warning">{t.students(data.totalCount)}</Badge> : null}
          </h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <Can permission="messages.bulkSend">
          <Button
            variant="success"
            size="lg"
            iconStart={<BellRing aria-hidden />}
            disabled={!data?.totalCount}
            onClick={() => setConfirming(true)}
          >
            {t.notifyAll}
          </Button>
        </Can>
      </header>
      <section className="list-panel">
        <DataTable
          startIndex={((data?.page ?? 1) - 1) * 20}
          caption={label}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={Users} title={t.empty} />}
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

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t.notifyAll}
        questionPrefix={t.notifyQuestion}
        itemName={label}
        description=""
        confirmLabel={t.notifyAll}
        tone="warning"
        onConfirm={async () => {
          try {
            const result = await notify({ type, studentIds: [] }).unwrap();
            toast.success(t.queued(result.queued));
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
