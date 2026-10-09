import { api } from '@/services/api';
import type { ScheduledReportRequest } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Reports — live /reports/financial, /reports/attendance (UTC ranges) and /scheduled-reports. */
type NonNull<T> = Exclude<T, null>;
export type ReportType = NonNull<ScheduledReportRequest['reportType']>;
export type ReportFrequency = NonNull<ScheduledReportRequest['frequency']>;
export type ReportChannel = NonNull<ScheduledReportRequest['channel']>;
export const REPORT_TYPES: readonly ReportType[] = [
  'DailySummary',
  'MonthlyIncome',
  'WeeklyAttendance',
  'ParentMonthly',
  'Debts',
];
export const REPORT_FREQUENCIES: readonly ReportFrequency[] = ['Daily', 'Weekly', 'Monthly'];
export const REPORT_CHANNELS: readonly ReportChannel[] = ['WhatsAppPdf', 'Email', 'InApp'];

export interface ScheduledReportDto {
  id: string;
  name: string;
  reportType: string;
  frequency: string;
  channel: string;
  nextRunAt: string | null;
  isActive: boolean;
  recipientUserIds: string[];
  workerConfigured: boolean;
}

export interface ScheduledReportInput {
  name: string;
  reportType: ReportType;
  frequency: ReportFrequency;
  channel: ReportChannel;
  recipientUserIds: string[];
  nextRunAtUtc: string;
  isActive: boolean;
}

const normalizeScheduled = (raw: unknown, index = 0): ScheduledReportDto => {
  const recipients = read(raw, 'recipientUserIds');
  return {
    id: readString(raw, 'id') ?? `scheduled-${index}`,
    name: readString(raw, 'name') ?? '—',
    reportType: readString(raw, 'reportType') ?? '—',
    frequency: readString(raw, 'frequency') ?? '—',
    channel: readString(raw, 'channel') ?? '—',
    nextRunAt: readString(raw, 'nextRunAtUtc'),
    isActive: read(raw, 'isActive') !== false,
    recipientUserIds: Array.isArray(recipients)
      ? (recipients as unknown[]).filter((item): item is string => typeof item === 'string')
      : [],
    workerConfigured: read(raw, 'workerConfigured') !== false,
  };
};
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
    getScheduledReports: build.query<Paged<ScheduledReportDto>, ListParams>({
      query: (params) => ({
        url: '/scheduled-reports',
        params: { ...toQueryParams(params), includeInactive: true },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeScheduled, params, 'scheduled-reports'),
      providesTags: [{ type: 'ScheduledReport', id: 'LIST' }],
    }),
    saveScheduledReport: build.mutation<undefined, ScheduledReportInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/scheduled-reports/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/scheduled-reports', method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'ScheduledReport', id: 'LIST' }],
    }),
    deleteScheduledReport: build.mutation<undefined, string>({
      query: (id) => ({ url: `/scheduled-reports/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'ScheduledReport', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFinancialReportQuery,
  useGetAttendanceReportQuery,
  useGetScheduledReportsQuery,
  useSaveScheduledReportMutation,
  useDeleteScheduledReportMutation,
} = reportsApi;
