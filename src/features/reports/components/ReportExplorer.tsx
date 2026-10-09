'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { FileBarChart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { ExportButton } from '@/components/data/ExportButton';
import { Pagination } from '@/components/data/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatMoney, formatNumber, formatPercent } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { api } from '@/services/api';
import { normalizePaged, readNumber, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';

/** Generic ReportDataDto reports — GET /reports/{type} (+ /reports/{type}/export). */
const REPORT_TYPES = [
  'income-monthly',
  'debts',
  'at-risk-students',
  'attendance-by-group',
  'student-levels',
] as const;
type ReportKind = (typeof REPORT_TYPES)[number];

type Row = Record<string, string | number | null> & { key: string };

const TEXT = ['fullName', 'code', 'groupName', 'month'] as const;
const NUMBERS = [
  'charged',
  'collected',
  'expenses',
  'netCashFlow',
  'totalDue',
  'present',
  'late',
  'absent',
  'excused',
  'attendanceRate',
  'averageGrade',
  'consecutiveAbsences',
  'count',
] as const;
const MONEY = new Set(['charged', 'collected', 'expenses', 'netCashFlow', 'totalDue']);

const reportApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReportData: build.query<
      Paged<Row>,
      { type: ReportKind; from: string; to: string; page: number }
    >({
      query: ({ type, from, to, page }) => ({
        url: `/reports/${type}`,
        params: { from, to, page, pageSize: 20 },
      }),
      transformResponse: (raw: unknown, _meta, { page }) =>
        normalizePaged(
          raw,
          (item, index): Row => {
            const row: Row = {
              key: readString(item, 'studentId', 'groupId', 'month') ?? `row-${index}`,
            };
            for (const field of TEXT) row[field] = readString(item, field);
            for (const field of NUMBERS) row[field] = readNumber(item, field);
            return row;
          },
          { page, pageSize: 20 },
          'report-data',
        ),
      providesTags: [{ type: 'Report', id: 'DATA' }],
    }),
  }),
});

const { useGetReportDataQuery } = reportApi;
const t = ar.reports.explorer;

/** Picks a report type, renders only the columns that report fills, exports the full report. */
export function ReportExplorer({ from, to }: { from: string; to: string }) {
  const [type, setType] = useState<ReportKind>('income-monthly');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useGetReportDataQuery({
    type,
    from,
    to,
    page,
  });

  const columns = useMemo<ColumnDef<Row>[]>(() => {
    const rows = data?.items ?? [];
    const present = (field: string) => rows.some((row) => row[field] !== null);
    return [...TEXT, ...NUMBERS].filter(present).map((field): ColumnDef<Row> => ({
      id: field,
      header: t.columns[field] ?? field,
      meta: {
        className: NUMBERS.includes(field as (typeof NUMBERS)[number]) ? 'tabular' : undefined,
      },
      cell: ({ row }) => {
        const value = row.original[field];
        if (value === null || value === undefined) return '—';
        if (typeof value === 'string') return value;
        if (MONEY.has(field)) return formatMoney(value);
        if (field === 'attendanceRate') return formatPercent(value > 1 ? value / 100 : value);
        return formatNumber(value);
      },
    }));
  }, [data]);

  return (
    <section className="list-panel" aria-label={t.title}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-lg font-bold text-ink">{t.title}</h2>
        <div className="w-full sm:w-64">
          <Select
            aria-label={t.title}
            value={type}
            onValueChange={(value) => {
              setType(value as ReportKind);
              setPage(1);
            }}
            options={REPORT_TYPES.map((value) => ({ value, label: t.types[value] ?? value }))}
          />
        </div>
        <Can permission="reports.export">
          <ExportButton
            path={`/reports/${type}/export`}
            params={{ from, to }}
            fileName={`report-${type}-${from}-${to}`}
          />
        </Can>
      </div>
      <DataTable
        startIndex={((data?.page ?? 1) - 1) * 20}
        caption={t.types[type] ?? type}
        data={data?.items}
        columns={columns}
        getRowId={(row) => row.key}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error ? toProblem(error).title : null}
        onRetry={() => void refetch()}
        empty={<EmptyState icon={FileBarChart} title={t.empty} />}
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
  );
}
