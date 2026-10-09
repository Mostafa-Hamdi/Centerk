import { api } from '@/services/api';
import { read, readNumber, readString } from '@/services/normalize';

/** Halls management — live /halls (NewHall / EditHallRequest); shares the Hall tag with group forms. */
export interface HallDto {
  id: string;
  name: string;
  capacity: number | null;
  equipment: string | null;
  isAvailable: boolean;
}

export interface HallInput {
  name: string;
  capacity: number;
  equipment: string | null;
  isAvailable: boolean;
}

const hallsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHallsAdmin: build.query<HallDto[], string | undefined>({
      query: (branchId) => ({ url: '/halls', params: branchId ? { branchId } : undefined }),
      transformResponse: (raw: unknown) => {
        const list = Array.isArray(raw) ? raw : read(raw, 'items');
        return Array.isArray(list)
          ? (list as unknown[]).map((hall, index) => ({
              id: readString(hall, 'id') ?? `hall-${index}`,
              name: readString(hall, 'name') ?? '—',
              capacity: readNumber(hall, 'capacity'),
              equipment: readString(hall, 'equipment'),
              isAvailable: read(hall, 'isAvailable') !== false,
            }))
          : [];
      },
      providesTags: [{ type: 'Hall', id: 'LIST' }],
    }),
    saveHall: build.mutation<undefined, HallInput & { id?: string; branchId?: string }>({
      query: ({ id, branchId, isAvailable, ...body }) =>
        id
          ? {
              url: `/halls/${encodeURIComponent(id)}`,
              method: 'PUT',
              body: { ...body, isAvailable },
            }
          : { url: '/halls', method: 'POST', body: { ...body, branchId } },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Hall', id: 'LIST' }],
    }),
    deleteHall: build.mutation<undefined, string>({
      query: (id) => ({ url: `/halls/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Hall', id: 'LIST' }],
    }),
  }),
});

export const { useGetHallsAdminQuery, useSaveHallMutation, useDeleteHallMutation } = hallsApi;
