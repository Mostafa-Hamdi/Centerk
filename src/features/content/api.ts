import { api } from '@/services/api';
import type { AssignmentRequest, CourseRequest } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Online content — live /videos (+hide), /assignments (+open/close) and /courses (bundles). */
export type AssignmentKind = Exclude<AssignmentRequest['kind'], null>;
export const ASSIGNMENT_KINDS: readonly AssignmentKind[] = ['Homework', 'Pdf', 'Worksheet'];

export type CourseAccess = Exclude<CourseRequest['accessDuration'], null>;
export const COURSE_ACCESS: readonly CourseAccess[] = ['Month', 'ThreeMonths', 'UntilTermEnd'];

export interface CourseDto {
  id: string;
  title: string;
  groupId: string | null;
  price: number;
  accessDuration: string;
  status: string;
  videoIds: string[];
  assignmentIds: string[];
}

export interface CourseInput {
  title: string;
  groupId: string;
  price: number;
  accessDuration: CourseAccess;
  status: 'Available' | 'Stopped';
  videoIds: string[];
  assignmentIds: string[];
}

const ids = (value: unknown): string[] =>
  Array.isArray(value)
    ? (value as unknown[]).filter((item): item is string => typeof item === 'string')
    : [];

const normalizeCourse = (raw: unknown, index = 0): CourseDto => ({
  id: readString(raw, 'id') ?? `course-${index}`,
  title: readString(raw, 'title') ?? '—',
  groupId: readString(raw, 'groupId'),
  price: readNumber(raw, 'price') ?? 0,
  accessDuration: readString(raw, 'accessDuration') ?? 'Month',
  status: readString(raw, 'status') ?? 'Available',
  videoIds: ids(read(raw, 'videoIds')),
  assignmentIds: ids(read(raw, 'assignmentIds')),
});

export interface SubmissionDto {
  id: string;
  studentId: string | null;
  studentName: string | null;
  note: string | null;
  status: string;
  submittedAt: string | null;
  score: number | null;
  feedback: string | null;
}

const normalizeSubmission = (raw: unknown, index: number): SubmissionDto => ({
  id: readString(raw, 'id') ?? `submission-${index}`,
  studentId: readString(raw, 'studentId'),
  studentName: readString(raw, 'studentName', 'student.fullName', 'student.name'),
  note: readString(raw, 'note'),
  status: readString(raw, 'status') ?? 'Submitted',
  submittedAt: readString(raw, 'submittedAtUtc'),
  score: readNumber(raw, 'score'),
  feedback: readString(raw, 'feedback'),
});

export interface VideoDto {
  id: string;
  title: string;
  groupId: string | null;
  providerVideoId: string | null;
  durationSeconds: number;
  maxViewsPerStudent: number;
  price: number | null;
  watermark: boolean;
  status: string;
  isActive: boolean;
}

export interface AssignmentDto {
  id: string;
  title: string;
  groupId: string | null;
  kind: string;
  description: string | null;
  dueAt: string | null;
  maxScore: number | null;
  status: string;
}

const normalizeVideo = (raw: unknown, index = 0): VideoDto => ({
  id: readString(raw, 'id') ?? `video-${index}`,
  title: readString(raw, 'title') ?? '—',
  groupId: readString(raw, 'groupId'),
  providerVideoId: readString(raw, 'providerVideoId'),
  durationSeconds: readNumber(raw, 'durationSeconds') ?? 0,
  maxViewsPerStudent: readNumber(raw, 'maxViewsPerStudent') ?? 0,
  price: readNumber(raw, 'price'),
  watermark: read(raw, 'watermark') === true,
  status: readString(raw, 'status') ?? 'Ready',
  isActive: read(raw, 'isActive') !== false,
});

const normalizeAssignment = (raw: unknown, index = 0): AssignmentDto => ({
  id: readString(raw, 'id') ?? `assignment-${index}`,
  title: readString(raw, 'title') ?? '—',
  groupId: readString(raw, 'groupId'),
  kind: readString(raw, 'kind') ?? 'Homework',
  description: readString(raw, 'description'),
  dueAt: readString(raw, 'dueAtUtc'),
  maxScore: readNumber(raw, 'maxScore'),
  status: readString(raw, 'status') ?? 'Open',
});

const withInactive = (params: ListParams) => ({ ...toQueryParams(params), includeInactive: true });

const contentApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVideos: build.query<Paged<VideoDto>, ListParams>({
      query: (params) => ({ url: '/videos', params: withInactive(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeVideo, params, 'videos'),
      providesTags: [{ type: 'Video', id: 'LIST' }],
    }),
    createVideo: build.mutation<
      VideoDto,
      {
        title: string;
        groupId: string;
        providerVideoId: string | null;
        durationSeconds: number;
        maxViewsPerStudent: number;
        price: number | null;
        watermark: boolean;
      }
    >({
      query: (body) => ({ url: '/videos', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeVideo(raw),
      invalidatesTags: [{ type: 'Video', id: 'LIST' }],
    }),
    hideVideo: build.mutation<undefined, string>({
      query: (id) => ({ url: `/videos/${encodeURIComponent(id)}/hide`, method: 'POST' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Video', id: 'LIST' }],
    }),

    getAssignments: build.query<Paged<AssignmentDto>, ListParams>({
      query: (params) => ({ url: '/assignments', params: withInactive(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeAssignment, params, 'assignments'),
      providesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    createAssignment: build.mutation<
      AssignmentDto,
      {
        title: string;
        groupId: string;
        kind: AssignmentKind;
        description: string;
        dueAtUtc: string | null;
        maxScore: number | null;
      }
    >({
      query: (body) => ({ url: '/assignments', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeAssignment(raw),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    setAssignmentOpen: build.mutation<undefined, { id: string; open: boolean }>({
      query: ({ id, open }) => ({
        url: `/assignments/${encodeURIComponent(id)}/${open ? 'open' : 'close'}`,
        method: 'POST',
      }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    getAssignment: build.query<AssignmentDto, string>({
      query: (id) => `/assignments/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeAssignment(raw),
      providesTags: (_result, _error, id) => [{ type: 'Assignment', id }],
    }),
    getSubmissions: build.query<Paged<SubmissionDto>, ListParams & { assignmentId: string }>({
      query: ({ assignmentId, ...params }) => ({
        url: `/assignments/${encodeURIComponent(assignmentId)}/submissions`,
        params: toQueryParams(params),
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeSubmission, params, 'submissions'),
      providesTags: (_result, _error, { assignmentId }) => [
        { type: 'Assignment', id: `SUBMISSIONS-${assignmentId}` },
      ],
    }),
    gradeSubmission: build.mutation<
      undefined,
      { id: string; assignmentId: string; score: number | null; feedback: string | null }
    >({
      query: ({ id, score, feedback }) => ({
        url: `/submissions/${encodeURIComponent(id)}/grade`,
        method: 'PUT',
        body: { score, feedback },
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: 'Assignment', id: `SUBMISSIONS-${assignmentId}` },
      ],
    }),
    getCourses: build.query<Paged<CourseDto>, ListParams>({
      query: (params) => ({ url: '/courses', params: withInactive(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeCourse, params, 'courses'),
      providesTags: [{ type: 'Course', id: 'LIST' }],
    }),
    saveCourse: build.mutation<undefined, CourseInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/courses/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/courses', method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Course', id: 'LIST' }],
    }),
    deleteCourse: build.mutation<undefined, string>({
      query: (id) => ({ url: `/courses/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Course', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAssignmentQuery,
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
  useGetCoursesQuery,
  useSaveCourseMutation,
  useDeleteCourseMutation,
  useGetVideosQuery,
  useCreateVideoMutation,
  useHideVideoMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useSetAssignmentOpenMutation,
} = contentApi;
