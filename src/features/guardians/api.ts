import { api } from '@/services/api';
import { normalizePaged, read, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';

/** Guardians — live /guardians (list by phone, create / edit / delete, linked students). */
export interface GuardianDto {
  id: string;
  fullName: string;
  phone: string | null;
}

const normalizeGuardian = (raw: unknown, index = 0): GuardianDto => {
  const source = read(raw, 'guardian') ?? raw;
  return {
    id: readString(source, 'id') ?? `guardian-${index}`,
    fullName: readString(source, 'fullName') ?? '—',
    phone: readString(source, 'phone'),
  };
};

const guardiansApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGuardians: build.query<
      Paged<GuardianDto>,
      { phone?: string; page: number; pageSize: number }
    >({
      query: ({ phone, page, pageSize }) => ({
        url: '/guardians',
        params: { page, pageSize, ...(phone ? { phone } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeGuardian, params, 'guardians'),
      providesTags: [{ type: 'Guardian', id: 'LIST' }],
    }),
    saveGuardian: build.mutation<undefined, { id?: string; fullName: string; phone: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/guardians/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/guardians', method: 'POST', body },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Guardian', id: 'LIST' }, 'Student'],
    }),
    deleteGuardian: build.mutation<undefined, string>({
      query: (id) => ({ url: `/guardians/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Guardian', id: 'LIST' }],
    }),
  }),
});

export const { useGetGuardiansQuery, useSaveGuardianMutation, useDeleteGuardianMutation } =
  guardiansApi;
