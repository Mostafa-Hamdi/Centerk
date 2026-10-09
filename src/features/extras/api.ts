import { api } from '@/services/api';
import type { DiscountRequest, NewSession } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';

/**
 * Remaining guide endpoints: discounts (+ per student), group waitlist, one-off sessions + reopen,
 * dashboard alert drill-down / notify, quiz analytics.
 */
export type DiscountType = Exclude<DiscountRequest['type'], null>;
export type SessionKind = Exclude<NewSession['kind'], null>;
export const SESSION_KINDS: readonly SessionKind[] = ['Extra', 'Review', 'Makeup', 'Regular'];

export interface DiscountDto {
  id: string;
  name: string;
  type: string;
  value: number;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface StudentDiscountDto {
  id: string;
  discountId: string | null;
  groupId: string | null;
  validFrom: string | null;
  validTo: string | null;
  approved: boolean;
}

export interface WaitlistEntryDto {
  id: string;
  studentId: string | null;
  studentName: string;
  code: string | null;
  position: number;
  status: string;
}

export interface AlertStudentDto {
  id: string;
  fullName: string;
  code: string | null;
  phone: string | null;
}

export interface QuizAnalytics {
  gradedCount: number;
  maxScore: number;
  average: number | null;
  distribution: { excellent: number; good: number; pass: number; belowPass: number };
  top: { rank: number; name: string; code: string | null; score: number }[];
}

const list = (raw: unknown): unknown[] => {
  const items = Array.isArray(raw) ? raw : read(raw, 'items');
  return Array.isArray(items) ? (items as unknown[]) : [];
};

const extrasApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDiscounts: build.query<DiscountDto[], undefined>({
      query: () => '/discounts',
      transformResponse: (raw: unknown) =>
        list(raw).map((item, index) => ({
          id: readString(item, 'id') ?? `discount-${index}`,
          name: readString(item, 'name') ?? '—',
          type: readString(item, 'type') ?? 'Percent',
          value: readNumber(item, 'value') ?? 0,
          requiresApproval: read(item, 'requiresApproval') === true,
          isActive: read(item, 'isActive') !== false,
        })),
      providesTags: [{ type: 'Settings', id: 'DISCOUNTS' }],
    }),
    saveDiscount: build.mutation<
      undefined,
      { id?: string; name: string; type: DiscountType; value: number; requiresApproval: boolean }
    >({
      query: ({ id, ...body }) =>
        id
          ? { url: `/discounts/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/discounts', method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'DISCOUNTS' }],
    }),
    deleteDiscount: build.mutation<undefined, string>({
      query: (id) => ({ url: `/discounts/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'DISCOUNTS' }],
    }),

    getStudentDiscounts: build.query<StudentDiscountDto[], string>({
      query: (studentId) => `/students/${encodeURIComponent(studentId)}/discounts`,
      transformResponse: (raw: unknown) =>
        list(raw).map((item, index) => ({
          id: readString(item, 'id') ?? `assignment-${index}`,
          discountId: readString(item, 'discountId'),
          groupId: readString(item, 'groupId'),
          validFrom: readString(item, 'validFromUtc'),
          validTo: readString(item, 'validToUtc'),
          approved: Boolean(readString(item, 'approvedById')),
        })),
      providesTags: (_result, _error, studentId) => [{ type: 'Student', id: `DISC-${studentId}` }],
    }),
    studentDiscountAction: build.mutation<
      undefined,
      | { studentId: string; action: 'assign'; discountId: string; groupId?: string }
      | { studentId: string; action: 'approve' | 'remove'; assignmentId: string }
    >({
      query: (arg) => {
        const base = `/students/${encodeURIComponent(arg.studentId)}/discounts`;
        if (arg.action === 'assign')
          return {
            url: base,
            method: 'POST',
            body: {
              discountId: arg.discountId,
              groupId: arg.groupId,
              validFromUtc: new Date().toISOString(),
            },
          };
        const item = `${base}/${encodeURIComponent(arg.assignmentId)}`;
        return arg.action === 'approve'
          ? { url: `${item}/approve`, method: 'POST' }
          : { url: item, method: 'DELETE' };
      },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { studentId }) => [
        { type: 'Student', id: `DISC-${studentId}` },
        { type: 'Student', id: studentId },
        'Due',
      ],
    }),

    getWaitlist: build.query<WaitlistEntryDto[], string>({
      query: (groupId) => `/groups/${encodeURIComponent(groupId)}/waitlist`,
      transformResponse: (raw: unknown) =>
        list(raw)
          .map((item, index) => ({
            id: readString(item, 'id') ?? `entry-${index}`,
            studentId: readString(item, 'studentId'),
            studentName: readString(item, 'student.fullName', 'studentName') ?? '—',
            code: readString(item, 'student.code'),
            position: readNumber(item, 'position') ?? index + 1,
            status: readString(item, 'status') ?? 'Waiting',
          }))
          .sort((a, b) => a.position - b.position),
      providesTags: (_result, _error, groupId) => [{ type: 'Group', id: `WAIT-${groupId}` }],
    }),
    waitlistAction: build.mutation<
      undefined,
      { groupId: string; studentId?: string; entryId?: string }
    >({
      query: ({ groupId, studentId, entryId }) =>
        entryId
          ? {
              url: `/groups/${encodeURIComponent(groupId)}/waitlist/${encodeURIComponent(entryId)}`,
              method: 'DELETE',
            }
          : {
              url: `/groups/${encodeURIComponent(groupId)}/waitlist`,
              method: 'POST',
              body: { studentId },
            },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Group', id: `WAIT-${groupId}` }],
    }),

    createSession: build.mutation<
      undefined,
      {
        groupId: string;
        hallId?: string;
        startsAtUtc: string;
        durationMinutes: number;
        kind: SessionKind;
        topic?: string;
      }
    >({
      query: (body) => ({ url: '/sessions', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: ['Session', 'Dashboard'],
    }),
    reopenSession: build.mutation<undefined, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/sessions/${encodeURIComponent(id)}/reopen`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: () => undefined,
      invalidatesTags: ['Session', 'Attendance'],
    }),

    getAlertStudents: build.query<Paged<AlertStudentDto>, { type: string; page: number }>({
      query: ({ type, page }) => ({
        url: `/dashboard/alerts/${encodeURIComponent(type)}/students`,
        params: { page, pageSize: 20 },
      }),
      transformResponse: (raw: unknown, _meta, { page }) =>
        normalizePaged(
          raw,
          (item, index): AlertStudentDto => ({
            id: readString(item, 'id') ?? `student-${index}`,
            fullName: readString(item, 'fullName') ?? '—',
            code: readString(item, 'code'),
            phone: readString(item, 'parentPhone', 'phone'),
          }),
          { page, pageSize: 20 },
          'alert-students',
        ),
    }),
    notifyAlert: build.mutation<{ queued: number }, { type: string; studentIds: string[] }>({
      query: ({ type, studentIds }) => ({
        url: `/dashboard/alerts/${encodeURIComponent(type)}/notify`,
        method: 'POST',
        body: { studentIds },
      }),
      transformResponse: (raw: unknown) => ({ queued: readNumber(raw, 'queued', 'count') ?? 0 }),
      invalidatesTags: [{ type: 'Message', id: 'LIST' }],
    }),

    getQuizAnalytics: build.query<QuizAnalytics, string>({
      async queryFn(quizId, _api, _extra, baseQuery) {
        const id = encodeURIComponent(quizId);
        const [distribution, top] = await Promise.all([
          baseQuery(`/quizzes/${id}/distribution`),
          baseQuery({ url: `/quizzes/${id}/top`, params: { limit: 5 } }),
        ]);
        if (distribution.error) return { error: distribution.error };
        const raw = distribution.data;
        return {
          data: {
            gradedCount: readNumber(raw, 'gradedCount') ?? 0,
            maxScore: readNumber(raw, 'maxScore') ?? 0,
            average: readNumber(raw, 'average'),
            distribution: {
              excellent: readNumber(raw, 'distribution.excellent') ?? 0,
              good: readNumber(raw, 'distribution.good') ?? 0,
              pass: readNumber(raw, 'distribution.pass') ?? 0,
              belowPass: readNumber(raw, 'distribution.belowPass') ?? 0,
            },
            top: top.error
              ? []
              : list(top.data).map((item, index) => ({
                  rank: readNumber(item, 'rank') ?? index + 1,
                  name: readString(item, 'student.fullName') ?? '—',
                  code: readString(item, 'student.code'),
                  score: readNumber(item, 'score') ?? 0,
                })),
          },
        };
      },
      providesTags: (_result, _error, quizId) => [{ type: 'Quiz', id: `STATS-${quizId}` }],
    }),
  }),
});

export const {
  useGetDiscountsQuery,
  useSaveDiscountMutation,
  useDeleteDiscountMutation,
  useGetStudentDiscountsQuery,
  useStudentDiscountActionMutation,
  useGetWaitlistQuery,
  useWaitlistActionMutation,
  useCreateSessionMutation,
  useReopenSessionMutation,
  useGetAlertStudentsQuery,
  useNotifyAlertMutation,
  useGetQuizAnalyticsQuery,
} = extrasApi;
