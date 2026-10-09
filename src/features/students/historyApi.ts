import { api } from '@/services/api';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';

/** Student history for staff — GET /students/{id}/attendance, /grades; excuses inbox — /excuses. */
export interface AttendanceHistoryRow {
  id: string;
  date: string | null;
  groupName: string | null;
  topic: string | null;
  status: string;
}

export interface GradeHistoryRow {
  id: string;
  title: string;
  date: string | null;
  score: number | null;
  maxScore: number | null;
}

export interface ExcuseDto {
  id: string;
  studentId: string | null;
  studentName: string | null;
  date: string | null;
  reason: string | null;
  wantsMakeup: boolean;
  status: string;
}

type Args = { studentId: string; page: number };

const historyApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStudentAttendance: build.query<Paged<AttendanceHistoryRow>, Args>({
      query: ({ studentId, page }) => ({
        url: `/students/${encodeURIComponent(studentId)}/attendance`,
        params: { page, pageSize: 10 },
      }),
      transformResponse: (raw: unknown, _meta, { page }) =>
        normalizePaged(
          raw,
          (item, index): AttendanceHistoryRow => ({
            id: readString(item, 'id', 'sessionId') ?? `row-${index}`,
            date: readString(item, 'startsAtUtc', 'session.startsAtUtc', 'recordedAtUtc', 'date'),
            groupName: readString(item, 'groupName', 'group.name', 'session.groupName'),
            topic: readString(item, 'topic', 'session.topic'),
            status: readString(item, 'status') ?? '—',
          }),
          { page, pageSize: 10 },
          'student-attendance',
        ),
    }),
    getStudentGrades: build.query<Paged<GradeHistoryRow>, Args>({
      query: ({ studentId, page }) => ({
        url: `/students/${encodeURIComponent(studentId)}/grades`,
        params: { page, pageSize: 10 },
      }),
      transformResponse: (raw: unknown, _meta, { page }) =>
        normalizePaged(
          raw,
          (item, index): GradeHistoryRow => ({
            id: readString(item, 'id', 'quizId') ?? `row-${index}`,
            title: readString(item, 'title', 'quizTitle', 'quiz.title') ?? '—',
            date: readString(item, 'createdAtUtc', 'publishedAtUtc', 'date'),
            score: readNumber(item, 'score'),
            maxScore: readNumber(item, 'maxScore', 'quiz.maxScore'),
          }),
          { page, pageSize: 10 },
          'student-grades',
        ),
    }),
    getExcuses: build.query<Paged<ExcuseDto>, { status?: string; page: number }>({
      query: ({ status, page }) => ({
        url: '/excuses',
        params: { page, pageSize: 20, ...(status ? { status } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, { page }) =>
        normalizePaged(
          raw,
          (item, index): ExcuseDto => ({
            id: readString(item, 'id') ?? `excuse-${index}`,
            studentId: readString(item, 'studentId'),
            studentName: readString(item, 'studentName', 'student.fullName'),
            date: readString(item, 'dateUtc'),
            reason: readString(item, 'reason'),
            wantsMakeup: read(item, 'wantsMakeup') === true,
            status: readString(item, 'status') ?? 'Pending',
          }),
          { page, pageSize: 20 },
          'excuses',
        ),
      providesTags: [{ type: 'Attendance', id: 'EXCUSES' }],
    }),
    decideExcuse: build.mutation<undefined, { id: string; approve: boolean }>({
      query: ({ id, approve }) => ({
        url: `/excuses/${encodeURIComponent(id)}/${approve ? 'approve' : 'reject'}`,
        method: 'POST',
      }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Attendance', id: 'EXCUSES' }],
    }),
  }),
});

export const {
  useGetStudentAttendanceQuery,
  useGetStudentGradesQuery,
  useGetExcusesQuery,
  useDecideExcuseMutation,
} = historyApi;
