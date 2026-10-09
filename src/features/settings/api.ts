import { api } from '@/services/api';
import { read, readNumber, readString } from '@/services/normalize';

/** Settings basics — live /branches and /subjects (catalogue used by groups, units and pricing). */
export interface BranchDto {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isOpen: boolean;
}

export interface SubjectDto {
  id: string;
  name: string;
  defaultPrice: number | null;
  isActive: boolean;
}

const list = (raw: unknown): unknown[] => {
  const items = read(raw, 'items') ?? raw;
  return Array.isArray(items) ? (items as unknown[]) : [];
};

const settingsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBranches: build.query<BranchDto[], undefined>({
      query: () => '/branches',
      transformResponse: (raw: unknown) =>
        list(raw).map((item, index) => ({
          id: readString(item, 'id') ?? `branch-${index}`,
          name: readString(item, 'name') ?? '—',
          address: readString(item, 'address'),
          phone: readString(item, 'phone'),
          isOpen: read(item, 'isOpen') !== false,
        })),
      providesTags: [{ type: 'Branch', id: 'LIST' }],
    }),
    saveBranch: build.mutation<
      undefined,
      { id?: string; name: string; address: string | null; phone: string | null; isOpen: boolean }
    >({
      query: ({ id, isOpen, ...body }) =>
        id
          ? { url: `/branches/${encodeURIComponent(id)}`, method: 'PUT', body: { ...body, isOpen } }
          : { url: '/branches', method: 'POST', body },
      transformResponse: () => undefined,
      // The branch switcher reads branches from /me.
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }, 'Me'],
    }),
    deleteBranch: build.mutation<undefined, string>({
      query: (id) => ({ url: `/branches/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }, 'Me'],
    }),

    getSubjectsSettings: build.query<SubjectDto[], undefined>({
      query: () => ({
        url: '/subjects',
        params: { page: 1, pageSize: 200, includeInactive: true },
      }),
      transformResponse: (raw: unknown) =>
        list(raw).map((item, index) => ({
          id: readString(item, 'id') ?? `subject-${index}`,
          name: readString(item, 'name') ?? '—',
          defaultPrice: readNumber(item, 'defaultPrice'),
          isActive: read(item, 'isActive') !== false,
        })),
      providesTags: [{ type: 'Settings', id: 'SUBJECTS' }],
    }),
    saveSubject: build.mutation<
      undefined,
      { id?: string; name: string; defaultPrice: number | null; isActive: boolean }
    >({
      query: ({ id, ...body }) =>
        id
          ? { url: `/subjects/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/subjects', method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'SUBJECTS' }],
    }),
    deleteSubject: build.mutation<undefined, string>({
      query: (id) => ({ url: `/subjects/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'SUBJECTS' }],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useSaveBranchMutation,
  useDeleteBranchMutation,
  useGetSubjectsSettingsQuery,
  useSaveSubjectMutation,
  useDeleteSubjectMutation,
} = settingsApi;
