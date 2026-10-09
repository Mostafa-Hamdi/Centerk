'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Banknote, CalendarClock, ClipboardList, Receipt, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { ExportButton } from '@/components/data/ExportButton';
import { buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery } from '@/features/groups/api';
import { ar } from '@/i18n/ar';
import { formatMoney, formatNumber, formatPercent } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useGetAttendanceReportQuery,
  useGetFinancialReportQuery,
  type AttendanceReportRow,
  type ReportRange,
} from '../api';

const t = ar.reports;
const ALL = 'all';

/** /reports — financial summary + attendance per student for a date range (URL), students CSV. */
export function ReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const today = new Date();
  const range: ReportRange = {
    from: searchParams.get('from') ?? format(startOfMonth(today), 'yyyy-MM-dd'),
    to: searchParams.get('to') ?? format(endOfMonth(today), 'yyyy-MM-dd'),
  };
  const groupId = searchParams.get('groupId') ?? ALL;

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="reports.schedule">
            <Link
              href={routes.reports.scheduled.list}
              className={buttonVariants({ variant: 'info' })}
            >
              <CalendarClock className="size-4" aria-hidden />
              {t.scheduledLink}
            </Link>
          </Can>
          <Can permission="reports.export">
            <ExportButton
              path="/reports/students.csv"
              params={{}}
              fileName="students"
              extension="csv"
              label={t.exportStudents}
            />
          </Can>
        </div>
      </header>

      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:max-w-xl">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          {t.from}
          <DatePicker
            aria-label={t.from}
            value={range.from}
            onChange={(value) => setParam('from', value || null)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          {t.to}
          <DatePicker
            aria-label={t.to}
            value={range.to}
            onChange={(value) => setParam('to', value || null)}
          />
        </label>
      </Card>

      <FinancialSection range={range} />
      <AttendanceSection
        range={range}
        groupId={groupId}
        onGroupChange={(value) => setParam('groupId', value === ALL ? null : value)}
      />
    </div>
  );
}

function FinancialSection({ range }: { range: ReportRange }) {
  const branchId = useAppSelector(selectCurrentBranchId);
  const { data, error, refetch, isLoading } = useGetFinancialReportQuery({
    ...range,
    branchId: branchId ?? undefined,
  });

  if (error)
    return (
      <ErrorState
        title={ar.list.loadError}
        description={toProblem(error).title}
        onRetry={() => void refetch()}
      />
    );

  const maxMethod = Math.max(1, ...(data?.byMethod ?? []).map((item) => item.amount));

  return (
    <section aria-labelledby="financial" className="flex flex-col gap-4">
      <h2 id="financial" className="font-display text-lg font-bold text-ink">
        {t.financial.title}
      </h2>
      {isLoading || !data ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <>
          <div className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t.financial.charged}
              value={formatMoney(data.charged)}
              icon={Receipt}
            />
            <StatCard
              label={t.financial.collected}
              value={formatMoney(data.collected)}
              icon={Banknote}
              tone="success"
            />
            <StatCard
              label={t.financial.expenses}
              value={formatMoney(data.expenses)}
              icon={Wallet}
              tone="danger"
            />
            <StatCard
              label={t.financial.net}
              value={formatMoney(data.netCashFlow)}
              icon={TrendingUp}
              tone={data.netCashFlow >= 0 ? 'cyan' : 'warning'}
            />
          </div>
          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-ink">{t.financial.byMethod}</h3>
            {data.byMethod.length ? (
              <ul className="flex flex-col gap-3">
                {data.byMethod.map((item) => (
                  <li key={item.method} className="flex flex-col gap-1">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium text-ink">
                        {ar.payments.methods[item.method] ?? item.method}
                        <span className="ms-2 text-xs text-muted">
                          {t.financial.count(item.count)}
                        </span>
                      </span>
                      <span className="font-medium tabular">{formatMoney(item.amount)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-canvas">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(item.amount / maxMethod) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t.financial.empty}</p>
            )}
          </Card>
        </>
      )}
    </section>
  );
}

function AttendanceSection({
  range,
  groupId,
  onGroupChange,
}: {
  range: ReportRange;
  groupId: string;
  onGroupChange: (value: string) => void;
}) {
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const { data, isLoading, isFetching, error, refetch } = useGetAttendanceReportQuery({
    ...range,
    groupId: groupId === ALL ? undefined : groupId,
  });

  const columns = useMemo<ColumnDef<AttendanceReportRow>[]>(
    () => [
      {
        accessorKey: 'studentName',
        header: t.attendance.columns.student,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.studentName}</span>
            {row.original.studentCode ? (
              <span dir="ltr" className="text-xs text-muted tabular">
                {row.original.studentCode}
              </span>
            ) : null}
          </div>
        ),
      },
      ...(['present', 'late', 'absent', 'excused'] as const).map(
        (key): ColumnDef<AttendanceReportRow> => ({
          accessorKey: key,
          header: t.attendance.columns[key],
          meta: { className: 'tabular' },
          cell: ({ getValue }) => formatNumber(getValue<number>()),
        }),
      ),
      {
        accessorKey: 'percent',
        header: t.attendance.columns.percent,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => {
          const value = getValue<number>();
          const ratio = value > 1 ? value / 100 : value;
          return (
            <span
              className={
                ratio >= 0.85 ? 'text-success' : ratio >= 0.6 ? 'text-warning' : 'text-danger'
              }
            >
              {formatPercent(ratio)}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <section
      aria-labelledby="attendance-report"
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="attendance-report" className="font-display text-lg font-bold text-ink">
          {t.attendance.title}
        </h2>
        <div className="w-full sm:w-64">
          <Select
            aria-label={ar.onlineExams.columns.group}
            value={groupId}
            onValueChange={onGroupChange}
            options={[
              { value: ALL, label: t.attendance.allGroups },
              ...(groups.data?.items ?? []).map((group) => ({
                value: group.id,
                label: group.name,
              })),
            ]}
          />
        </div>
      </div>
      <DataTable
        caption={t.attendance.caption}
        data={data}
        columns={columns}
        getRowId={(row) => row.studentId}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error ? toProblem(error).title : null}
        onRetry={() => void refetch()}
        empty={<EmptyState icon={ClipboardList} title={t.attendance.empty} />}
      />
    </section>
  );
}
