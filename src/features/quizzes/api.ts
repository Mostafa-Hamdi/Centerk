import { api } from '@/services/api';
import { read, readNumber, readString, warnShape } from '@/services/normalize';
import type { GradeInputV1, NewQuizV1 } from '@/services/generated/backend';

/** Session quizzes — live API: /quizzes (list by group, details, PUT grades, publish). Untyped → normalized. */
export type QuizStatus = 'Draft' | 'Published';

export interface QuizListItemDto {
  id: string;
  title: string;
  groupId: string | null;
  groupName: string | null;
  maxScore: number;
  status: QuizStatus;
  createdAt: string | null;
  average: number | null;
}

export interface QuizGradeRowDto {
  studentId: string;
  studentName: string;
  code: string | null;
  score: number | null;
}

export interface QuizDetailsDto extends QuizListItemDto {
  grades: QuizGradeRowDto[];
}

function normalizeQuiz(raw: unknown, index: number): QuizListItemDto {
  const published =
    read(raw, 'isPublished', 'published') === true ||
    readString(raw, 'status')?.toLowerCase() === 'published';
  return {
    id: readString(raw, 'id', 'quizId') ?? `quiz-${index}`,
    title: readString(raw, 'title', 'name') ?? '—',
    groupId: readString(raw, 'groupId', 'group.id'),
    groupName: readString(raw, 'groupName', 'group.name'),
    maxScore: readNumber(raw, 'maxScore', 'max') ?? 10,
    status: published ? 'Published' : 'Draft',
    createdAt: readString(raw, 'createdAt', 'createdAtUtc', 'date'),
    average: readNumber(raw, 'average', 'avg', 'stats.average'),
  };
}

function normalizeQuizList(raw: unknown): QuizListItemDto[] {
  const list = Array.isArray(raw) ? raw : read(raw, 'items', 'data', 'quizzes');
  if (!Array.isArray(list)) {
    warnShape('quizzes', raw);
    return [];
  }
  return list.map(normalizeQuiz);
}

function normalizeQuizDetails(raw: unknown): QuizDetailsDto {
  const rows = read(raw, 'grades', 'rows', 'students');
  if (!Array.isArray(rows)) warnShape('quizzes/{id}', raw);
  return {
    ...normalizeQuiz(read(raw, 'quiz') ?? raw, 0),
    grades: Array.isArray(rows)
      ? rows.map((row, index) => ({
          studentId: readString(row, 'studentId', 'student.id', 'id') ?? `student-${index}`,
          studentName: readString(row, 'studentName', 'student.fullName', 'fullName') ?? '—',
          code: readString(row, 'code', 'studentCode'),
          score: readNumber(row, 'score', 'grade'),
        }))
      : [],
  };
}

const quizzesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getQuizzes: build.query<QuizListItemDto[], string | undefined>({
      query: (groupId) => ({ url: '/quizzes', params: groupId ? { groupId } : undefined }),
      transformResponse: normalizeQuizList,
      providesTags: [{ type: 'Quiz', id: 'LIST' }],
    }),
    getQuiz: build.query<QuizDetailsDto, string>({
      query: (id) => `/quizzes/${encodeURIComponent(id)}`,
      transformResponse: normalizeQuizDetails,
      providesTags: (_result, _error, id) => [{ type: 'Quiz', id }],
    }),
    createQuiz: build.mutation<QuizListItemDto, NewQuizV1>({
      query: (body) => ({ url: '/quizzes', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeQuiz(raw, 0),
      invalidatesTags: [{ type: 'Quiz', id: 'LIST' }],
    }),
    saveGrades: build.mutation<undefined, { id: string; grades: GradeInputV1[] }>({
      query: ({ id, grades }) => ({
        url: `/quizzes/${encodeURIComponent(id)}/grades`,
        method: 'PUT',
        body: grades,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Quiz', id },
        { type: 'Quiz', id: 'LIST' },
      ],
    }),
    publishQuiz: build.mutation<undefined, string>({
      query: (id) => ({ url: `/quizzes/${encodeURIComponent(id)}/publish`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Quiz', id },
        { type: 'Quiz', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetQuizzesQuery,
  useGetQuizQuery,
  useCreateQuizMutation,
  useSaveGradesMutation,
  usePublishQuizMutation,
} = quizzesApi;

/** Levels per backend-spec §9.4 (percentage of maxScore). */
export type GradeLevel = 'excellent' | 'veryGood' | 'good' | 'pass' | 'weak';
export function gradeLevel(score: number, maxScore: number): GradeLevel {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 85) return 'excellent';
  if (pct >= 75) return 'veryGood';
  if (pct >= 65) return 'good';
  if (pct >= 50) return 'pass';
  return 'weak';
}

/** Competition ranking (1, 2, 2, 4) on non-empty scores. */
export function rankScores(scores: (number | null)[]): (number | null)[] {
  const sorted = scores.filter((score): score is number => score !== null).sort((a, b) => b - a);
  return scores.map((score) => (score === null ? null : sorted.indexOf(score) + 1));
}
