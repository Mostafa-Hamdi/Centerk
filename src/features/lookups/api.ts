import { api } from '@/services/api';
import { readNumber, readString } from '@/services/normalize';

/** Shared lookups — live GET /lookups/grade-levels (GradeLevelLookupDto[]). */
export interface GradeLevelDto {
  id: string;
  name: string;
  stage: string | null;
}

const lookupsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGradeLevels: build.query<GradeLevelDto[], undefined>({
      query: () => '/lookups/grade-levels',
      transformResponse: (raw: unknown) =>
        Array.isArray(raw)
          ? (raw as unknown[])
              .map((item) => ({
                id: readString(item, 'id') ?? '',
                name: readString(item, 'name') ?? '',
                stage: readString(item, 'stage'),
                order: readNumber(item, 'sortOrder') ?? 0,
              }))
              .filter((grade) => grade.id && grade.name)
              .sort((a, b) => a.order - b.order)
              .map((grade) => ({ id: grade.id, name: grade.name, stage: grade.stage }))
          : [],
      providesTags: [{ type: 'Settings', id: 'GRADES' }],
      keepUnusedDataFor: 60 * 60,
    }),
  }),
});

export const { useGetGradeLevelsQuery } = lookupsApi;
