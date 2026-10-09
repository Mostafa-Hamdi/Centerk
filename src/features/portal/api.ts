import { api } from '@/services/api';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';

/** Guardian / student portal — live /portal/* (me, overview, sessions, balance, card, exams, assignments). */
export interface PortalChild {
  id: string;
  name: string;
  code: string | null;
  grade: string | null;
}

export interface PortalOverview {
  attendancePercent: number | null;
  averageScore: number | null;
  nextSession: { startsAt: string | null; topic: string | null } | null;
}

export interface PortalSession {
  id: string;
  startsAt: string | null;
  topic: string | null;
  status: string;
  attendance: string | null;
  quizzes: { title: string; score: number | null; maxScore: number | null }[];
}

export interface PortalBalance {
  totalDue: number;
  charges: { id: string; period: string | null; amount: number; paid: number; remaining: number }[];
}

export interface PortalExam {
  id: string;
  title: string;
  opensAt: string | null;
  closesAt: string | null;
  durationMinutes: number;
}

export interface AttemptQuestion {
  id: string;
  text: string;
  type: string;
  points: number;
  options: { label: string; text: string }[];
  correctLabel: string | null;
  explanation: string | null;
}

export interface AttemptAnswer {
  questionId: string;
  selectedLabel: string | null;
  essayText: string | null;
  isFlagged: boolean;
  pointsAwarded: number | null;
}

export interface Attempt {
  id: string;
  examId: string | null;
  expiresAt: string | null;
  status: string;
  score: number | null;
  questions: AttemptQuestion[];
  answers: AttemptAnswer[];
}

export interface PortalAssignment {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  maxScore: number | null;
  status: string;
  submission: { note: string | null; score: number | null; feedback: string | null } | null;
}

const list = (raw: unknown, ...paths: string[]): unknown[] => {
  const value = paths.length ? read(raw, ...paths) : raw;
  return Array.isArray(value) ? (value as unknown[]) : [];
};

const normalizeAttempt = (raw: unknown): Attempt => ({
  id: readString(raw, 'id') ?? '',
  examId: readString(raw, 'onlineExamId'),
  expiresAt: readString(raw, 'expiresAtUtc'),
  status: readString(raw, 'status') ?? 'InProgress',
  score: readNumber(raw, 'score'),
  questions: list(raw, 'questions').map((question) => ({
    id: readString(question, 'id', 'questionId') ?? '',
    text: readString(question, 'text') ?? '',
    type: readString(question, 'type') ?? 'Mcq',
    points: readNumber(question, 'points') ?? 1,
    options: list(question, 'options').map((option) => ({
      label: readString(option, 'label') ?? '',
      text: readString(option, 'text') ?? '',
    })),
    correctLabel: readString(question, 'correctLabel'),
    explanation: readString(question, 'explanation'),
  })),
  answers: list(raw, 'answers').map((answer) => ({
    questionId: readString(answer, 'questionId') ?? '',
    selectedLabel: readString(answer, 'selectedLabel'),
    essayText: readString(answer, 'essayText'),
    isFlagged: read(answer, 'isFlagged') === true,
    pointsAwarded: readNumber(answer, 'pointsAwarded'),
  })),
});

const portalApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPortalChildren: build.query<PortalChild[], undefined>({
      query: () => '/portal/me',
      transformResponse: (raw: unknown) =>
        list(raw, 'students').map((student, index) => ({
          id: readString(student, 'id') ?? `student-${index}`,
          name: readString(student, 'fullName') ?? '—',
          code: readString(student, 'code'),
          grade: readString(student, 'grade'),
        })),
    }),
    getPortalOverview: build.query<PortalOverview, string>({
      query: (studentId) => `/portal/students/${encodeURIComponent(studentId)}/overview`,
      transformResponse: (raw: unknown) => {
        const next = read(raw, 'nextSession');
        return {
          attendancePercent: readNumber(raw, 'attendancePercent'),
          averageScore: readNumber(raw, 'averageScore'),
          nextSession: next
            ? { startsAt: readString(next, 'startsAtUtc'), topic: readString(next, 'topic') }
            : null,
        };
      },
    }),
    getPortalSessions: build.query<Paged<PortalSession>, { studentId: string; page: number }>({
      query: ({ studentId, page }) => ({
        url: `/portal/students/${encodeURIComponent(studentId)}/sessions`,
        params: { page, pageSize: 10 },
      }),
      transformResponse: (raw: unknown, _meta, { page }) =>
        normalizePaged(
          raw,
          (item, index): PortalSession => ({
            id: readString(item, 'id') ?? `session-${index}`,
            startsAt: readString(item, 'startsAtUtc'),
            topic: readString(item, 'topic'),
            status: readString(item, 'status') ?? '—',
            attendance: readString(item, 'attendance'),
            quizzes: list(item, 'quizzes').map((quiz) => ({
              title: readString(quiz, 'title') ?? '—',
              score: readNumber(quiz, 'score'),
              maxScore: readNumber(quiz, 'maxScore'),
            })),
          }),
          { page, pageSize: 10 },
          'portal-sessions',
        ),
    }),
    getPortalBalance: build.query<PortalBalance, string>({
      query: (studentId) => `/portal/students/${encodeURIComponent(studentId)}/balance`,
      transformResponse: (raw: unknown) => ({
        totalDue: readNumber(raw, 'totalDue') ?? 0,
        charges: list(raw, 'charges').map((charge, index) => ({
          id: readString(charge, 'id') ?? `charge-${index}`,
          period: readString(charge, 'period'),
          amount: readNumber(charge, 'amount') ?? 0,
          paid: readNumber(charge, 'paid') ?? 0,
          remaining: readNumber(charge, 'remaining') ?? 0,
        })),
      }),
    }),
    getPortalCard: build.query<
      { code: string | null; name: string; grade: string | null },
      undefined
    >({
      query: () => '/portal/card',
      transformResponse: (raw: unknown) => ({
        code: readString(raw, 'code'),
        name: readString(raw, 'fullName') ?? '—',
        grade: readString(raw, 'grade'),
      }),
    }),

    getPortalExams: build.query<PortalExam[], undefined>({
      query: () => '/portal/exams',
      transformResponse: (raw: unknown) =>
        list(raw).map((exam, index) => ({
          id: readString(exam, 'id') ?? `exam-${index}`,
          title: readString(exam, 'title') ?? '—',
          opensAt: readString(exam, 'opensAtUtc'),
          closesAt: readString(exam, 'closesAtUtc'),
          durationMinutes: readNumber(exam, 'durationMinutes') ?? 0,
        })),
      providesTags: [{ type: 'OnlineExam', id: 'PORTAL' }],
    }),
    /** POST /portal/exams/{id}/attempts — starts (or resumes) the student's attempt. */
    startAttempt: build.mutation<Attempt, string>({
      query: (examId) => ({
        url: `/portal/exams/${encodeURIComponent(examId)}/attempts`,
        method: 'POST',
      }),
      transformResponse: normalizeAttempt,
    }),
    getAttempt: build.query<Attempt, string>({
      query: (attemptId) => `/portal/attempts/${encodeURIComponent(attemptId)}`,
      transformResponse: normalizeAttempt,
      providesTags: (_result, _error, id) => [{ type: 'OnlineExam', id: `ATTEMPT-${id}` }],
    }),
    saveAnswer: build.mutation<
      undefined,
      {
        attemptId: string;
        questionId: string;
        selectedLabel: string | null;
        essayText: string | null;
        isFlagged: boolean;
      }
    >({
      query: ({ attemptId, questionId, ...body }) => ({
        url: `/portal/attempts/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(questionId)}`,
        method: 'PUT',
        body,
      }),
      transformResponse: () => undefined,
    }),
    submitAttempt: build.mutation<undefined, string>({
      query: (attemptId) => ({
        url: `/portal/attempts/${encodeURIComponent(attemptId)}/submit`,
        method: 'POST',
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, id) => [
        { type: 'OnlineExam', id: `ATTEMPT-${id}` },
        { type: 'OnlineExam', id: 'PORTAL' },
      ],
    }),
    getAttemptReview: build.query<Attempt, string>({
      query: (attemptId) => `/portal/attempts/${encodeURIComponent(attemptId)}/review`,
      transformResponse: normalizeAttempt,
    }),

    getPortalAssignments: build.query<PortalAssignment[], undefined>({
      query: () => ({ url: '/portal/assignments', params: { page: 1, pageSize: 100 } }),
      transformResponse: (raw: unknown) =>
        list(raw, 'items').map((item, index) => {
          const submission = read(item, 'submission');
          return {
            id: readString(item, 'id', 'assignment.id') ?? `assignment-${index}`,
            title: readString(item, 'title', 'assignment.title') ?? '—',
            description: readString(item, 'description', 'assignment.description'),
            dueAt: readString(item, 'dueAtUtc', 'assignment.dueAtUtc'),
            maxScore: readNumber(item, 'maxScore', 'assignment.maxScore'),
            status: readString(item, 'status', 'assignment.status') ?? 'Open',
            submission: submission
              ? {
                  note: readString(submission, 'note'),
                  score: readNumber(submission, 'score'),
                  feedback: readString(submission, 'feedback'),
                }
              : null,
          };
        }),
      providesTags: [{ type: 'Assignment', id: 'PORTAL' }],
    }),
    submitAssignment: build.mutation<
      undefined,
      { id: string; note: string; mode: 'create' | 'update' | 'withdraw' }
    >({
      query: ({ id, note, mode }) => ({
        url: `/portal/assignments/${encodeURIComponent(id)}/submission`,
        method: mode === 'create' ? 'POST' : mode === 'update' ? 'PUT' : 'DELETE',
        ...(mode === 'withdraw' ? {} : { body: { note } }),
      }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Assignment', id: 'PORTAL' }],
    }),
  }),
});

export const {
  useGetPortalChildrenQuery,
  useGetPortalOverviewQuery,
  useGetPortalSessionsQuery,
  useGetPortalBalanceQuery,
  useGetPortalCardQuery,
  useGetPortalExamsQuery,
  useStartAttemptMutation,
  useGetAttemptQuery,
  useSaveAnswerMutation,
  useSubmitAttemptMutation,
  useGetAttemptReviewQuery,
  useGetPortalAssignmentsQuery,
  useSubmitAssignmentMutation,
} = portalApi;
