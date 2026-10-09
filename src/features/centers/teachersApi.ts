import { api } from '@/services/api';
import type { AgreementRequest } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';

/** External teachers + their settlement agreements — live /teachers, /teachers/{id}/agreements. */
export type AgreementType = Exclude<AgreementRequest['type'], null>;
export const AGREEMENT_TYPES: readonly AgreementType[] = [
  'Percentage',
  'HourlyRent',
  'PerStudent',
  'FixedMonthly',
];

export interface TeacherDto {
  id: string;
  fullName: string;
  phone: string | null;
  subjectId: string | null;
  isActive: boolean;
}

export interface AgreementDto {
  id: string;
  type: string;
  value: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

const normalizeTeacher = (raw: unknown, index = 0): TeacherDto => ({
  id: readString(raw, 'id') ?? `teacher-${index}`,
  fullName: readString(raw, 'fullName', 'name') ?? '—',
  phone: readString(raw, 'phone'),
  subjectId: readString(raw, 'subjectId'),
  isActive: read(raw, 'isActive') !== false,
});

const teachersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTeachers: build.query<
      Paged<TeacherDto>,
      { search?: string; page: number; pageSize: number }
    >({
      query: ({ search, page, pageSize }) => ({
        url: '/teachers',
        params: { page, pageSize, includeInactive: true, ...(search ? { search } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeTeacher, params, 'teachers'),
      providesTags: [{ type: 'Teacher', id: 'LIST' }],
    }),
    saveTeacher: build.mutation<
      undefined,
      { id?: string; fullName: string; phone: string; subjectId: string; isActive: boolean }
    >({
      query: ({ id, ...body }) =>
        id
          ? { url: `/teachers/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/teachers', method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Teacher', id: 'LIST' }],
    }),
    deleteTeacher: build.mutation<undefined, string>({
      query: (id) => ({ url: `/teachers/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Teacher', id: 'LIST' }],
    }),
    getAgreements: build.query<AgreementDto[], string>({
      query: (teacherId) => `/teachers/${encodeURIComponent(teacherId)}/agreements`,
      transformResponse: (raw: unknown) => {
        const list = Array.isArray(raw) ? raw : read(raw, 'items');
        return Array.isArray(list)
          ? (list as unknown[]).map((item, index) => ({
              id: readString(item, 'id') ?? `agreement-${index}`,
              type: readString(item, 'type') ?? '—',
              value: readNumber(item, 'value') ?? 0,
              effectiveFrom: readString(item, 'effectiveFrom'),
              effectiveTo: readString(item, 'effectiveTo'),
            }))
          : [];
      },
      providesTags: (_result, _error, teacherId) => [{ type: 'Teacher', id: `AGR-${teacherId}` }],
    }),
    addAgreement: build.mutation<
      undefined,
      { teacherId: string; type: AgreementType; value: number; effectiveFrom: string }
    >({
      query: ({ teacherId, ...body }) => ({
        url: `/teachers/${encodeURIComponent(teacherId)}/agreements`,
        method: 'POST',
        body,
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher', id: `AGR-${teacherId}` },
      ],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useSaveTeacherMutation,
  useDeleteTeacherMutation,
  useGetAgreementsQuery,
  useAddAgreementMutation,
} = teachersApi;
