import { api } from '@/services/api';
import type { QuestionRequest } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Question bank — live /questions, curriculum /units, /lessons, /subjects. */
type NonNull<T> = Exclude<T, null>;
export type QuestionType = NonNull<QuestionRequest['type']>;
export type Difficulty = NonNull<QuestionRequest['difficulty']>;
export const QUESTION_TYPES: readonly QuestionType[] = ['Mcq', 'TrueFalse', 'Essay'];
export const DIFFICULTIES: readonly Difficulty[] = ['Easy', 'Medium', 'Hard'];

export interface QuestionOption {
  label: string;
  text: string;
}

export interface QuestionDto {
  id: string;
  unitId: string | null;
  lessonId: string | null;
  type: string;
  difficulty: string;
  text: string;
  explanation: string | null;
  options: QuestionOption[];
  correctLabel: string | null;
  isActive: boolean;
}

export interface NamedItem {
  id: string;
  name: string;
}

export interface UnitDto extends NamedItem {
  subjectId: string | null;
  gradeLevelId: string | null;
  order: number;
}

export interface LessonDto extends NamedItem {
  unitId: string | null;
  order: number;
}

function normalizeQuestion(raw: unknown, index = 0): QuestionDto {
  const options = read(raw, 'options');
  return {
    id: readString(raw, 'id') ?? `question-${index}`,
    unitId: readString(raw, 'unitId'),
    lessonId: readString(raw, 'lessonId'),
    type: readString(raw, 'type') ?? 'Mcq',
    difficulty: readString(raw, 'difficulty') ?? 'Medium',
    text: readString(raw, 'text') ?? '',
    explanation: readString(raw, 'explanation'),
    options: Array.isArray(options)
      ? (options as unknown[]).map((option) => ({
          label: readString(option, 'label') ?? '',
          text: readString(option, 'text') ?? '',
        }))
      : [],
    correctLabel: readString(raw, 'correctLabel'),
    isActive: read(raw, 'isActive') !== false,
  };
}

const items = (raw: unknown): unknown[] => {
  const list = read(raw, 'items') ?? raw;
  return Array.isArray(list) ? (list as unknown[]) : [];
};

const byOrder = <T extends { order: number; name: string }>(a: T, b: T) =>
  a.order - b.order || a.name.localeCompare(b.name, 'ar');

export interface QuestionsParams extends ListParams {
  unitId?: string;
  type?: QuestionType;
  difficulty?: Difficulty;
}

export type QuestionInput = Omit<QuestionRequest, 'type' | 'difficulty' | 'options'> & {
  type: QuestionType;
  difficulty: Difficulty;
  options: QuestionOption[];
};

const ALL = { page: 1, pageSize: 200 };

const questionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getQuestions: build.query<Paged<QuestionDto>, QuestionsParams>({
      query: ({ unitId, type, difficulty, ...params }) => ({
        url: '/questions',
        params: {
          ...toQueryParams(params),
          ...(unitId ? { unitId } : {}),
          ...(type ? { type } : {}),
          ...(difficulty ? { difficulty } : {}),
        },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeQuestion, params, 'questions'),
      providesTags: [{ type: 'Question', id: 'LIST' }],
    }),
    getQuestion: build.query<QuestionDto, string>({
      query: (id) => `/questions/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeQuestion(raw),
      providesTags: (_result, _error, id) => [{ type: 'Question', id }],
    }),
    saveQuestion: build.mutation<QuestionDto, QuestionInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/questions/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/questions', method: 'POST', body },
      transformResponse: (raw: unknown) => normalizeQuestion(raw),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Question', id: 'LIST' },
        ...(id ? [{ type: 'Question' as const, id }] : []),
      ],
    }),
    questionAction: build.mutation<undefined, { id: string; action: 'duplicate' | 'delete' }>({
      query: ({ id, action }) =>
        action === 'delete'
          ? { url: `/questions/${encodeURIComponent(id)}`, method: 'DELETE' }
          : { url: `/questions/${encodeURIComponent(id)}/duplicate`, method: 'POST' },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Question', id: 'LIST' }],
    }),

    getUnits: build.query<UnitDto[], undefined>({
      query: () => ({ url: '/units', params: ALL }),
      transformResponse: (raw: unknown) =>
        items(raw)
          .filter((item) => read(item, 'isActive') !== false)
          .map((item) => ({
            id: readString(item, 'id') ?? '',
            name: readString(item, 'name') ?? '',
            subjectId: readString(item, 'subjectId'),
            gradeLevelId: readString(item, 'gradeLevelId'),
            order: readNumber(item, 'sortOrder') ?? 0,
          }))
          .filter((unit) => unit.id && unit.name)
          .sort(byOrder),
      providesTags: [{ type: 'Question', id: 'UNITS' }],
    }),
    addUnit: build.mutation<undefined, { name: string; subjectId: string; gradeLevelId: string }>({
      query: (body) => ({ url: '/units', method: 'POST', body: { ...body, isActive: true } }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Question', id: 'UNITS' }],
    }),
    getLessons: build.query<LessonDto[], undefined>({
      query: () => ({ url: '/lessons', params: ALL }),
      transformResponse: (raw: unknown) =>
        items(raw)
          .filter((item) => read(item, 'isActive') !== false)
          .map((item) => ({
            id: readString(item, 'id') ?? '',
            name: readString(item, 'name') ?? '',
            unitId: readString(item, 'unitId'),
            order: readNumber(item, 'sortOrder') ?? 0,
          }))
          .filter((lesson) => lesson.id && lesson.name)
          .sort(byOrder),
      providesTags: [{ type: 'Question', id: 'LESSONS' }],
    }),
    getSubjects: build.query<NamedItem[], undefined>({
      query: () => ({ url: '/subjects', params: ALL }),
      transformResponse: (raw: unknown) =>
        items(raw)
          .filter((item) => read(item, 'isActive') !== false)
          .map((item) => ({
            id: readString(item, 'id') ?? '',
            name: readString(item, 'name') ?? '',
          }))
          .filter((subject) => subject.id && subject.name),
      keepUnusedDataFor: 60 * 60,
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetQuestionQuery,
  useSaveQuestionMutation,
  useQuestionActionMutation,
  useGetUnitsQuery,
  useAddUnitMutation,
  useGetLessonsQuery,
  useGetSubjectsQuery,
} = questionsApi;
