import { api } from '@/services/api';
import { read, readNumber, readString } from '@/services/normalize';

/** Reports — live GET /reports/financial and /reports/attendance (UTC ranges). */
export interface FinancialReportDto {
  charged: number;
  collected: number;
  expenses: number;
  netCashFlow: number;
  byMethod: { method: string; amount: number; count: number }[];
}

export interface AttendanceReportRow {
  studentId: string;
  studentName: string;
  studentCode: string | null;
  present: number;
  late: number;
  absent: number;
  excused: number;
  percent: number;
}

export interface ReportRange {
  /** yyyy-MM-dd (local), converted to the UTC day bounds. */
  from: string;
  to: string;
}

const utcRange = ({ from, to }: ReportRange) => ({
  fromUtc: new Date(`${from}T00:00:00`).toISOString(),
  toUtc: new Date(`${to}T23:59:59`).toISOString(),
});

const reportsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFinancialReport: build.query<FinancialReportDto, ReportRange & { branchId?: string }>({
      query: ({ branchId, ...range }) => ({
        url: '/reports/financial',
        params: { ...utcRange(range), ...(branchId ? { branchId } : {}) },
      }),
      transformResponse: (raw: unknown) => {
        const byMethod = read(raw, 'byMethod');
        return {
          charged: readNumber(raw, 'charged') ?? 0,
          collected: readNumber(raw, 'collected') ?? 0,
          expenses: readNumber(raw, 'expenses') ?? 0,
          netCashFlow: readNumber(raw, 'netCashFlow') ?? 0,
          byMethod: Array.isArray(byMethod)
            ? (byMethod as unknown[]).map((item) => ({
                method: readString(item, 'method') ?? '—',
                amount: readNumber(item, 'amount') ?? 0,
                count: readNumber(item, 'count') ?? 0,
              }))
            : [],
        };
      },
      providesTags: [{ type: 'Report', id: 'FINANCIAL' }],
    }),
    getAttendanceReport: build.query<AttendanceReportRow[], ReportRange & { groupId?: string }>({
      query: ({ groupId, ...range }) => ({
        url: '/reports/attendance',
        params: { ...utcRange(range), ...(groupId ? { groupId } : {}) },
      }),
      transformResponse: (raw: unknown) =>
        Array.isArray(raw)
          ? (raw as unknown[]).map((item, index) => ({
              studentId: readString(item, 'student.id', 'studentId') ?? `row-${index}`,
              studentName: readString(item, 'student.fullName', 'studentName') ?? '—',
              studentCode: readString(item, 'student.code'),
              present: readNumber(item, 'present') ?? 0,
              late: readNumber(item, 'late') ?? 0,
              absent: readNumber(item, 'absent') ?? 0,
              excused: readNumber(item, 'excused') ?? 0,
              percent: readNumber(item, 'attendancePercent') ?? 0,
            }))
          : [],
      providesTags: [{ type: 'Report', id: 'ATTENDANCE' }],
    }),
  }),
});

export const { useGetFinancialReportQuery, useGetAttendanceReportQuery } = reportsApi;
