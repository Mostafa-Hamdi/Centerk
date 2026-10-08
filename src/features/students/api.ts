import { api } from '@/services/api';
import { normalizePaged } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';
import { normalizeStudentDetails, normalizeStudentRow } from './normalize';
import type {
  EditStudent,
  NewStudent,
  StudentDetailsDto,
  StudentListItemDto,
  StudentStatus,
} from './types';

/** Students — live API: /api/v1/students (list supports search + paging only). */
const studentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStudents: build.query<Paged<StudentListItemDto>, ListParams>({
      query: (params) => ({ url: '/students', params: toQueryParams(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeStudentRow, params, 'students'),
      providesTags: (result) => [
        { type: 'Student', id: 'LIST' },
        ...(result?.items.map((student) => ({ type: 'Student' as const, id: student.id })) ?? []),
      ],
      keepUnusedDataFor: 60,
    }),
    getStudent: build.query<StudentDetailsDto, string>({
      query: (id) => `/students/${encodeURIComponent(id)}`,
      transformResponse: normalizeStudentDetails,
      providesTags: (_result, _error, id) => [{ type: 'Student', id }],
      keepUnusedDataFor: 300,
    }),
    createStudent: build.mutation<StudentDetailsDto, NewStudent>({
      query: (body) => ({ url: '/students', method: 'POST', body }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }, 'Dashboard'],
    }),
    updateStudent: build.mutation<StudentDetailsDto, { id: string; body: EditStudent }>({
      query: ({ id, body }) => ({
        url: `/students/${encodeURIComponent(id)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Student', id },
        { type: 'Student', id: 'LIST' },
      ],
    }),
    changeStudentStatus: build.mutation<
      undefined,
      { id: string; status: StudentStatus; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/students/${encodeURIComponent(id)}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Student', id },
        { type: 'Student', id: 'LIST' },
      ],
    }),
    /** Archives (Withdrawn) per backend-spec §10.3. Optimistically removes the row from cached pages. */
    deleteStudent: build.mutation<undefined, string>({
      query: (id) => ({ url: `/students/${encodeURIComponent(id)}`, method: 'DELETE' }),
      async onQueryStarted(id, lifecycle) {
        const { dispatch, queryFulfilled } = lifecycle;
        const patches = studentsApi.util
          .selectInvalidatedBy(lifecycle.getState(), [{ type: 'Student', id: 'LIST' }])
          .filter((entry) => entry.endpointName === 'getStudents')
          .map((entry) =>
            dispatch(
              studentsApi.util.updateQueryData(
                'getStudents',
                entry.originalArgs as ListParams,
                (draft) => {
                  const before = draft.items.length;
                  draft.items = draft.items.filter((student) => student.id !== id);
                  if (draft.items.length < before) draft.totalCount -= 1;
                },
              ),
            ),
          );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => {
            patch.undo();
          });
        }
      },
      invalidatesTags: (_result, error, id) =>
        error ? [] : [{ type: 'Student', id: 'LIST' }, { type: 'Student', id }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useChangeStudentStatusMutation,
  useDeleteStudentMutation,
} = studentsApi;

/** Prefetch on hover/intent: `const prefetch = useStudentsPrefetch('getStudent')`. */
export const useStudentsPrefetch: typeof studentsApi.usePrefetch = (endpoint, options) =>
  studentsApi.usePrefetch(endpoint, options);
