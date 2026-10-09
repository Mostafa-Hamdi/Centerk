import { api } from '@/services/api';
import { read, readNumber, readString } from '@/services/normalize';

/** Settings — live /settings/tenant, /settings/policies, /branches, /subjects, /grade-levels, /academic-terms. */
export const GRADE_STAGES = [
  'Primary',
  'Prep',
  'Secondary',
  'University',
  'International',
] as const;
export type GradeStage = (typeof GRADE_STAGES)[number];
export const TERM_STATUSES = ['Upcoming', 'Current', 'Finished'] as const;
export type TermStatus = (typeof TERM_STATUSES)[number];

export interface TenantProfileDto {
  name: string;
  slug: string | null;
  plan: string | null;
  timeZone: string | null;
}

export interface GradeLevelSettingDto {
  id: string;
  name: string;
  stage: string | null;
  order: number;
  isActive: boolean;
}

export interface AcademicTermDto {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

/** Policies are a free-form key → value map (booleans, numbers, strings). */
export type Policies = Record<string, string | number | boolean>;

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
    getTenantProfile: build.query<TenantProfileDto, undefined>({
      query: () => '/settings/tenant',
      transformResponse: (raw: unknown) => ({
        name: readString(raw, 'name') ?? '',
        slug: readString(raw, 'slug'),
        plan: readString(raw, 'plan'),
        timeZone: readString(raw, 'timeZone'),
      }),
      providesTags: [{ type: 'Settings', id: 'TENANT' }],
    }),
    updateTenantProfile: build.mutation<undefined, { name: string }>({
      query: (body) => ({ url: '/settings/tenant', method: 'PUT', body }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'TENANT' }, 'Me'],
    }),
    getPolicies: build.query<Policies, undefined>({
      query: () => '/settings/policies',
      transformResponse: (raw: unknown) =>
        Object.fromEntries(
          Object.entries(raw && typeof raw === 'object' ? raw : {}).filter(
            (entry): entry is [string, string | number | boolean] =>
              ['string', 'number', 'boolean'].includes(typeof entry[1]),
          ),
        ),
      providesTags: [{ type: 'Settings', id: 'POLICIES' }],
    }),
    updatePolicies: build.mutation<undefined, Policies>({
      query: (body) => ({ url: '/settings/policies', method: 'PUT', body }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'POLICIES' }],
    }),

    getGradeLevelsSettings: build.query<GradeLevelSettingDto[], undefined>({
      query: () => ({
        url: '/grade-levels',
        params: { page: 1, pageSize: 200, includeInactive: true },
      }),
      transformResponse: (raw: unknown) =>
        list(raw)
          .map((item, index) => ({
            id: readString(item, 'id') ?? `grade-${index}`,
            name: readString(item, 'name') ?? '—',
            stage: readString(item, 'stage'),
            order: readNumber(item, 'sortOrder') ?? 0,
            isActive: read(item, 'isActive') !== false,
          }))
          .sort((a, b) => a.order - b.order),
      providesTags: [{ type: 'Settings', id: 'GRADES' }],
    }),
    saveGradeLevel: build.mutation<
      undefined,
      { id?: string; name: string; stage: GradeStage; sortOrder: number; isActive: boolean }
    >({
      query: ({ id, ...body }) =>
        id
          ? { url: `/grade-levels/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/grade-levels', method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'GRADES' }],
    }),
    deleteGradeLevel: build.mutation<undefined, string>({
      query: (id) => ({ url: `/grade-levels/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'GRADES' }],
    }),

    getAcademicTerms: build.query<AcademicTermDto[], undefined>({
      query: () => ({ url: '/academic-terms', params: { page: 1, pageSize: 100 } }),
      transformResponse: (raw: unknown) =>
        list(raw).map((item, index) => ({
          id: readString(item, 'id') ?? `term-${index}`,
          name: readString(item, 'name') ?? '—',
          startDate: readString(item, 'startDate'),
          endDate: readString(item, 'endDate'),
          status: readString(item, 'status') ?? 'Upcoming',
        })),
      providesTags: [{ type: 'Settings', id: 'TERMS' }],
    }),
    saveAcademicTerm: build.mutation<
      undefined,
      { id?: string; name: string; startDate: string; endDate: string; status: TermStatus }
    >({
      query: ({ id, ...body }) =>
        id
          ? { url: `/academic-terms/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/academic-terms', method: 'POST', body: { ...body, isActive: true } },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'TERMS' }],
    }),
    deleteAcademicTerm: build.mutation<undefined, string>({
      query: (id) => ({ url: `/academic-terms/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settings', id: 'TERMS' }],
    }),

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
  useGetTenantProfileQuery,
  useUpdateTenantProfileMutation,
  useGetPoliciesQuery,
  useUpdatePoliciesMutation,
  useGetGradeLevelsSettingsQuery,
  useSaveGradeLevelMutation,
  useDeleteGradeLevelMutation,
  useGetAcademicTermsQuery,
  useSaveAcademicTermMutation,
  useDeleteAcademicTermMutation,
  useGetBranchesQuery,
  useSaveBranchMutation,
  useDeleteBranchMutation,
  useGetSubjectsSettingsQuery,
  useSaveSubjectMutation,
  useDeleteSubjectMutation,
} = settingsApi;
