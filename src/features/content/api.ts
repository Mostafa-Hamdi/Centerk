import { api } from '@/services/api';
import type { AssignmentRequest } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Online content — live /videos (+hide) and /assignments (+open/close). */
export type AssignmentKind = Exclude<AssignmentRequest['kind'], null>;
export const ASSIGNMENT_KINDS: readonly AssignmentKind[] = ['Homework', 'Pdf', 'Worksheet'];

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
  }),
});

export const {
  useGetVideosQuery,
  useCreateVideoMutation,
  useHideVideoMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useSetAssignmentOpenMutation,
} = contentApi;
