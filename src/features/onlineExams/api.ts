import { api } from '@/services/api';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Online exams — live /online-exams (+ publish / unpublish / results), built from the question bank. */
export interface OnlineExamDto {
  id: string;
  title: string;
  groupId: string | null;
  opensAt: string | null;
  closesAt: string | null;
  durationMinutes: number;
  showAnswersAfterClose: boolean;
  status: string;
  questions: { questionId: string; text: string; points: number }[];
}

export interface ExamResultDto {
  id: string;
  studentName: string;
  studentCode: string | null;
  score: number | null;
  maxScore: number | null;
  status: string;
  submittedAt: string | null;
}

export interface OnlineExamInput {
  title: string;
  groupId: string;
  opensAtUtc: string;
  closesAtUtc: string;
  durationMinutes: number;
  showAnswersAfterClose: boolean;
  questions: { questionId: string; points: number }[];
}

export const isDraft = (exam: Pick<OnlineExamDto, 'status'>) =>
  exam.status.toLowerCase() === 'draft';

function normalizeExam(raw: unknown, index = 0): OnlineExamDto {
  const questions = read(raw, 'questions');
  return {
    id: readString(raw, 'id') ?? `exam-${index}`,
    title: readString(raw, 'title') ?? '—',
    groupId: readString(raw, 'groupId'),
    opensAt: readString(raw, 'opensAtUtc'),
    closesAt: readString(raw, 'closesAtUtc'),
    durationMinutes: readNumber(raw, 'durationMinutes') ?? 0,
    showAnswersAfterClose: read(raw, 'showAnswersAfterClose') === true,
    status: readString(raw, 'status') ?? 'Draft',
    questions: Array.isArray(questions)
      ? (questions as unknown[]).map((question) => ({
          questionId: readString(question, 'questionId', 'id') ?? '',
          text: readString(question, 'text') ?? '',
          points: readNumber(question, 'points') ?? 1,
        }))
      : [],
  };
}

const normalizeResult = (raw: unknown, index: number): ExamResultDto => ({
  id: readString(raw, 'id', 'attemptId') ?? `result-${index}`,
  studentName: readString(raw, 'studentName', 'student.fullName', 'student.name') ?? '—',
  studentCode: readString(raw, 'studentCode', 'student.code'),
  score: readNumber(raw, 'score'),
  maxScore: readNumber(raw, 'maxScore', 'totalPoints'),
  status: readString(raw, 'status') ?? '—',
  submittedAt: readString(raw, 'submittedAtUtc', 'finishedAtUtc'),
});

export interface OnlineExamsParams extends ListParams {
  groupId?: string;
}

const onlineExamsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOnlineExams: build.query<Paged<OnlineExamDto>, OnlineExamsParams>({
      query: ({ groupId, ...params }) => ({
        url: '/online-exams',
        params: { ...toQueryParams(params), ...(groupId ? { groupId } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeExam, params, 'online-exams'),
      providesTags: [{ type: 'OnlineExam', id: 'LIST' }],
    }),
    getOnlineExam: build.query<OnlineExamDto, string>({
      query: (id) => `/online-exams/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeExam(raw),
      providesTags: (_result, _error, id) => [{ type: 'OnlineExam', id }],
    }),
    saveOnlineExam: build.mutation<OnlineExamDto, OnlineExamInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/online-exams/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/online-exams', method: 'POST', body },
      transformResponse: (raw: unknown) => normalizeExam(raw),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'OnlineExam', id: 'LIST' },
        ...(id ? [{ type: 'OnlineExam' as const, id }] : []),
      ],
    }),
    onlineExamAction: build.mutation<
      undefined,
      { id: string; action: 'publish' | 'unpublish' | 'delete' }
    >({
      query: ({ id, action }) =>
        action === 'delete'
          ? { url: `/online-exams/${encodeURIComponent(id)}`, method: 'DELETE' }
          : { url: `/online-exams/${encodeURIComponent(id)}/${action}`, method: 'POST' },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'OnlineExam', id: 'LIST' },
        { type: 'OnlineExam', id },
      ],
    }),
    getOnlineExamResults: build.query<Paged<ExamResultDto>, ListParams & { id: string }>({
      query: ({ id, ...params }) => ({
        url: `/online-exams/${encodeURIComponent(id)}/results`,
        params: toQueryParams(params),
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeResult, params, 'online-exam-results'),
      providesTags: (_result, _error, { id }) => [{ type: 'OnlineExam', id: `RESULTS-${id}` }],
    }),
  }),
});

export const {
  useGetOnlineExamsQuery,
  useGetOnlineExamQuery,
  useSaveOnlineExamMutation,
  useOnlineExamActionMutation,
  useGetOnlineExamResultsQuery,
} = onlineExamsApi;
