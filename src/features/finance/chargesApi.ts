import { api } from '@/services/api';
import { readNumber } from '@/services/normalize';

/** Charges management — live /charges (create, generate a month, correct, waive, cancel). */
const chargesApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** POST /charges/generate?period=yyyy-MM — monthly charges for every active enrollment. */
    generateCharges: build.mutation<{ created: number }, string>({
      query: (period) => ({ url: '/charges/generate', method: 'POST', params: { period } }),
      transformResponse: (raw: unknown) => ({
        created: readNumber(raw, 'created', 'count', 'generated') ?? 0,
      }),
      invalidatesTags: ['Due', 'Dashboard'],
    }),
    createCharge: build.mutation<
      undefined,
      { studentId: string; groupId: string; period: string; amount: number }
    >({
      query: (body) => ({ url: '/charges', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { studentId }) => [{ type: 'Due', id: studentId }, 'Due'],
    }),
    editCharge: build.mutation<
      undefined,
      { id: string; studentId: string; amount: number; reason: string }
    >({
      query: ({ id, amount, reason }) => ({
        url: `/charges/${encodeURIComponent(id)}`,
        method: 'PUT',
        body: { amount, reason },
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { studentId }) => [{ type: 'Due', id: studentId }, 'Due'],
    }),
    chargeAction: build.mutation<
      undefined,
      { id: string; studentId: string; action: 'waive' | 'delete'; reason: string }
    >({
      query: ({ id, action, reason }) =>
        action === 'waive'
          ? { url: `/charges/${encodeURIComponent(id)}/waive`, method: 'POST', body: { reason } }
          : { url: `/charges/${encodeURIComponent(id)}`, method: 'DELETE', params: { reason } },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { studentId }) => [
        { type: 'Due', id: studentId },
        'Due',
        'Dashboard',
      ],
    }),
  }),
});

export const {
  useGenerateChargesMutation,
  useCreateChargeMutation,
  useEditChargeMutation,
  useChargeActionMutation,
} = chargesApi;
