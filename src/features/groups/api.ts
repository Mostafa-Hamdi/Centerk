import { api } from '@/services/api';
import { normalizePaged } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';
import {
  normalizeGroupDetails,
  normalizeGroupRow,
  normalizeHalls,
  normalizeSchedule,
} from './normalize';
import type {
  GroupDetailsDto,
  GroupListItemDto,
  HallOptionDto,
  NewGroup,
  UpdateGroupRequest,
  WeeklySlotDto,
} from './types';

/** Groups — live API: /api/v1/groups (list: paging only; search/filters requested, §6). */
const groupsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGroups: build.query<Paged<GroupListItemDto>, ListParams>({
      query: (params) => ({ url: '/groups', params: toQueryParams(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeGroupRow, params, 'groups'),
      providesTags: (result) => [
        { type: 'Group', id: 'LIST' },
        ...(result?.items.map((group) => ({ type: 'Group' as const, id: group.id })) ?? []),
      ],
    }),
    getGroup: build.query<GroupDetailsDto, string>({
      query: (id) => `/groups/${encodeURIComponent(id)}`,
      transformResponse: normalizeGroupDetails,
      providesTags: (_result, _error, id) => [{ type: 'Group', id }],
      keepUnusedDataFor: 300,
    }),
    getGroupSchedule: build.query<WeeklySlotDto[], string>({
      query: (id) => `/groups/${encodeURIComponent(id)}/schedule`,
      transformResponse: normalizeSchedule,
      providesTags: (_result, _error, id) => [{ type: 'Group', id }],
    }),
    createGroup: build.mutation<GroupDetailsDto, NewGroup>({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      transformResponse: normalizeGroupDetails,
      invalidatesTags: [{ type: 'Group', id: 'LIST' }, 'Dashboard'],
    }),
    updateGroup: build.mutation<GroupDetailsDto, { id: string; body: UpdateGroupRequest }>({
      query: ({ id, body }) => ({ url: `/groups/${encodeURIComponent(id)}`, method: 'PUT', body }),
      transformResponse: normalizeGroupDetails,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Group', id },
        { type: 'Group', id: 'LIST' },
      ],
    }),
    /** POST /groups/{id}/pause | /resume */
    setGroupPaused: build.mutation<undefined, { id: string; paused: boolean }>({
      query: ({ id, paused }) => ({
        url: `/groups/${encodeURIComponent(id)}/${paused ? 'pause' : 'resume'}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Group', id },
        { type: 'Group', id: 'LIST' },
        'Dashboard',
      ],
    }),
    getHalls: build.query<HallOptionDto[], string | undefined>({
      query: (branchId) => ({ url: '/halls', params: branchId ? { branchId } : undefined }),
      transformResponse: normalizeHalls,
      providesTags: [{ type: 'Hall', id: 'LIST' }],
      keepUnusedDataFor: 600,
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupQuery,
  useGetGroupScheduleQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useSetGroupPausedMutation,
  useGetHallsQuery,
} = groupsApi;

export const useGroupsPrefetch: typeof groupsApi.usePrefetch = (endpoint, options) =>
  groupsApi.usePrefetch(endpoint, options);
