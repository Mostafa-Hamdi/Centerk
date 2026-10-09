import { api } from '@/services/api';
import { normalizePaged, read, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';

/**
 * Remaining guide endpoints: attendance correction, quiz make-ups, hall clashes, scheduled report
 * runs, expense categories, curriculum units & lessons.
 */
export type CorrectableStatus = 'Present' | 'Late' | 'Absent' | 'Excused';

export interface MakeupDto {
  id: string;
  studentId: string | null;
  scheduledAt: string | null;
  status: string;
}

export interface ClashDto {
  id: string;
  reason: string | null;
  first: { id: string; kind: string; startsAt: string | null; endsAt: string | null };
  second: { id: string; kind: string; startsAt: string | null; endsAt: string | null };
}

export interface ReportRunDto {
  id: string;
  scheduledFor: string | null;
  generatedAt: string | null;
  delivered: boolean;
}

export interface NamedRow {
  id: string;
  name: string;
  isActive: boolean;
  parentId: string | null;
}

const list = (raw: unknown): unknown[] => {
  const items = Array.isArray(raw) ? raw : read(raw, 'items');
  return Array.isArray(items) ? (items as unknown[]) : [];
};

const occupancy = (raw: unknown) => ({
  id: readString(raw, 'id') ?? '',
  kind: readString(raw, 'kind') ?? '—',
  startsAt: readString(raw, 'startsAtUtc'),
  endsAt: readString(raw, 'endsAtUtc'),
});

const named = (parentKey?: string) => (raw: unknown) =>
  list(raw).map((item, index): NamedRow => ({
    id: readString(item, 'id') ?? `row-${index}`,
    name: readString(item, 'name') ?? '—',
    isActive: read(item, 'isActive') !== false,
    parentId: parentKey ? readString(item, parentKey) : null,
  }));

const ALL = { page: 1, pageSize: 200, includeInactive: true };

const api2 = api.injectEndpoints({
  endpoints: (build) => ({
    correctAttendance: build.mutation<
      undefined,
      | { recordId: string; status: CorrectableStatus; reason: string }
      | { recordId: string; remove: true; reason: string }
    >({
      query: (arg) =>
        'remove' in arg
          ? {
              url: `/attendance/${encodeURIComponent(arg.recordId)}`,
              method: 'DELETE',
              params: { reason: arg.reason },
            }
          : {
              url: `/attendance/${encodeURIComponent(arg.recordId)}`,
              method: 'PUT',
              body: { status: arg.status, reason: arg.reason },
            },
      transformResponse: () => undefined,
      invalidatesTags: ['Attendance', 'Dashboard'],
    }),

    getMakeups: build.query<MakeupDto[], string>({
      query: (quizId) => `/quizzes/${encodeURIComponent(quizId)}/makeups`,
      transformResponse: (raw: unknown) =>
        list(raw).map((item, index) => ({
          id: readString(item, 'id') ?? `makeup-${index}`,
          studentId: readString(item, 'studentId'),
          scheduledAt: readString(item, 'scheduledAtUtc'),
          status: readString(item, 'status') ?? 'Scheduled',
        })),
      providesTags: (_result, _error, quizId) => [{ type: 'Quiz', id: `MAKEUPS-${quizId}` }],
    }),
    makeupAction: build.mutation<
      undefined,
      | { quizId: string; action: 'schedule'; studentId: string; scheduledAtUtc: string }
      | { quizId: string; action: 'cancel'; makeupId: string }
      | { quizId: string; action: 'complete'; makeupId: string; score: number; reason: string }
    >({
      query: (arg) => {
        const base = `/quizzes/${encodeURIComponent(arg.quizId)}/makeups`;
        if (arg.action === 'schedule')
          return {
            url: base,
            method: 'POST',
            body: { studentId: arg.studentId, scheduledAtUtc: arg.scheduledAtUtc },
          };
        const item = `${base}/${encodeURIComponent(arg.makeupId)}`;
        return arg.action === 'cancel'
          ? { url: item, method: 'DELETE' }
          : {
              url: `${item}/complete`,
              method: 'POST',
              body: { score: arg.score, reason: arg.reason },
            };
      },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { quizId }) => [
        { type: 'Quiz', id: `MAKEUPS-${quizId}` },
        { type: 'Quiz', id: quizId },
        { type: 'Quiz', id: `STATS-${quizId}` },
      ],
    }),

    getClashes: build.query<ClashDto[], string>({
      query: (date) => ({ url: '/hall-bookings/clashes', params: { date } }),
      transformResponse: (raw: unknown) =>
        list(raw).map((item, index) => ({
          id: readString(item, 'id') ?? `clash-${index}`,
          reason: readString(item, 'reason'),
          first: occupancy(read(item, 'first')),
          second: occupancy(read(item, 'second')),
        })),
      providesTags: [{ type: 'HallBooking', id: 'CLASHES' }],
    }),
    resolveClash: build.mutation<
      undefined,
      {
        id: string;
        date: string;
        bookingId: string;
        reason: string;
        startsAtUtc?: string;
        endsAtUtc?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/hall-bookings/clashes/${encodeURIComponent(id)}/resolve`,
        method: 'POST',
        body,
      }),
      transformResponse: () => undefined,
      invalidatesTags: [
        { type: 'HallBooking', id: 'CLASHES' },
        { type: 'HallBooking', id: 'LIST' },
      ],
    }),

    getReportRuns: build.query<Paged<ReportRunDto>, string>({
      query: (id) => ({
        url: `/scheduled-reports/${encodeURIComponent(id)}/runs`,
        params: { page: 1, pageSize: 20 },
      }),
      transformResponse: (raw: unknown) =>
        normalizePaged(
          raw,
          (item, index): ReportRunDto => ({
            id: readString(item, 'id') ?? `run-${index}`,
            scheduledFor: readString(item, 'scheduledForUtc'),
            generatedAt: readString(item, 'generatedAtUtc'),
            delivered: read(item, 'delivered') === true,
          }),
          { page: 1, pageSize: 20 },
          'report-runs',
        ),
      providesTags: (_result, _error, id) => [{ type: 'ScheduledReport', id: `RUNS-${id}` }],
    }),
    runReportNow: build.mutation<undefined, string>({
      query: (id) => ({
        url: `/scheduled-reports/${encodeURIComponent(id)}/run-now`,
        method: 'POST',
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, id) => [{ type: 'ScheduledReport', id: `RUNS-${id}` }],
    }),

    getExpenseCategoriesAdmin: build.query<NamedRow[], undefined>({
      query: () => ({ url: '/expense-categories', params: ALL }),
      transformResponse: named(),
      providesTags: [{ type: 'Expense', id: 'CATEGORIES' }],
    }),
    getUnitsAdmin: build.query<NamedRow[], undefined>({
      query: () => ({ url: '/units', params: ALL }),
      transformResponse: named(),
      providesTags: [{ type: 'Question', id: 'UNITS' }],
    }),
    getLessonsAdmin: build.query<NamedRow[], undefined>({
      query: () => ({ url: '/lessons', params: ALL }),
      transformResponse: named('unitId'),
      providesTags: [{ type: 'Question', id: 'LESSONS' }],
    }),
    /** Generic catalogue writes for /expense-categories, /units, /lessons. */
    saveCatalogItem: build.mutation<
      undefined,
      {
        resource: 'expense-categories' | 'units' | 'lessons';
        id?: string;
        body: Record<string, unknown>;
        remove?: boolean;
      }
    >({
      query: ({ resource, id, body, remove }) =>
        remove && id
          ? { url: `/${resource}/${encodeURIComponent(id)}`, method: 'DELETE' }
          : id
            ? { url: `/${resource}/${encodeURIComponent(id)}`, method: 'PUT', body }
            : { url: `/${resource}`, method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { resource }) =>
        resource === 'expense-categories'
          ? [{ type: 'Expense', id: 'CATEGORIES' }]
          : resource === 'units'
            ? [{ type: 'Question', id: 'UNITS' }]
            : [{ type: 'Question', id: 'LESSONS' }],
    }),
  }),
});

export const {
  useCorrectAttendanceMutation,
  useGetMakeupsQuery,
  useMakeupActionMutation,
  useGetClashesQuery,
  useResolveClashMutation,
  useGetReportRunsQuery,
  useRunReportNowMutation,
  useGetExpenseCategoriesAdminQuery,
  useGetUnitsAdminQuery,
  useGetLessonsAdminQuery,
  useSaveCatalogItemMutation,
} = api2;
