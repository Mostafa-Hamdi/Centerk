import { api } from '@/services/api';
import { normalizeSummary, normalizeTodaySessions } from './normalize';

/**
 * Dashboard — live API: GET /dashboard/summary, GET /dashboard/today-sessions (no response schemas
 * in Swagger, shapes follow backend-spec §10.2). `alerts` and `income-7d` are spec-only (mocked).
 */
/** Normalized — any value the backend doesn't send is `null` (rendered as "—"). */
export interface DashboardSummaryDto {
  incomeToday: number | null;
  incomeYesterday: number | null;
  sessionsToday: {
    total: number | null;
    live: number | null;
    upcoming: number | null;
    done: number | null;
    cancelled: number | null;
  };
  /** 0–1 */
  monthlyAttendanceRate: number | null;
  openDues: { total: number | null; count: number | null };
  activeStudents: number | null;
}

export type SessionStatus = 'Upcoming' | 'Live' | 'Done' | 'Cancelled';

export interface TodaySessionDto {
  id: string;
  groupName: string;
  subject: string;
  teacherName: string;
  hallName: string | null;
  /** "HH:mm" in Cairo time */
  startTime: string;
  endTime: string;
  status: SessionStatus;
  expected: number;
  present: number;
}

export type AlertType = 'consecutive-absences' | 'weak-last-quiz' | 'overdue-30' | 'waitlist';

export interface DashboardAlertDto {
  type: AlertType;
  count: number;
}

export interface IncomePointDto {
  /** YYYY-MM-DD */
  date: string;
  amount: number;
}

const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query<DashboardSummaryDto, undefined>({
      query: () => '/dashboard/summary',
      transformResponse: normalizeSummary,
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 120,
    }),
    getTodaySessions: build.query<TodaySessionDto[], undefined>({
      query: () => '/dashboard/today-sessions',
      transformResponse: normalizeTodaySessions,
      providesTags: ['Dashboard', 'Session'],
      keepUnusedDataFor: 120,
    }),
    getDashboardAlerts: build.query<DashboardAlertDto[], undefined>({
      query: () => '/dashboard/alerts',
      providesTags: ['Dashboard'],
    }),
    getIncome7d: build.query<IncomePointDto[], undefined>({
      query: () => '/dashboard/income-7d',
      providesTags: ['Dashboard', 'Payment'],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetTodaySessionsQuery,
  useGetDashboardAlertsQuery,
  useGetIncome7dQuery,
} = dashboardApi;
