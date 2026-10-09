import { api } from '@/services/api';
import { read, readNumber, readString } from '@/services/normalize';

/**
 * Last guide endpoints: question Excel import, direct message + messaging usage, group duplicate /
 * session generation / recurrence, cancelling stock movements and material deliveries.
 */
export interface ImportResult {
  created: number;
  skipped: number;
  errors: { rowNumber: number; message: string }[];
}

export interface MessagingUsage {
  pending: number;
  delivered: number;
  failed: number;
  cancelled: number;
  providerConfigured: boolean;
}

export interface Recurrence {
  enabled: boolean;
  startsOn: string | null;
  endsOn: string | null;
  horizonDays: number;
  nextRefreshAt: string | null;
}

const api3 = api.injectEndpoints({
  endpoints: (build) => ({
    importQuestions: build.mutation<ImportResult, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return {
          url: '/questions/import',
          method: 'POST',
          headers: { 'Idempotency-Key': crypto.randomUUID() },
          body,
        };
      },
      transformResponse: (raw: unknown) => {
        const errors = read(raw, 'errors');
        return {
          created: readNumber(raw, 'created') ?? 0,
          skipped: readNumber(raw, 'skipped') ?? 0,
          errors: Array.isArray(errors)
            ? (errors as unknown[]).map((error) => ({
                rowNumber: readNumber(error, 'rowNumber') ?? 0,
                message: readString(error, 'message', 'code') ?? '',
              }))
            : [],
        };
      },
      invalidatesTags: [{ type: 'Question', id: 'LIST' }],
    }),

    getMessagingUsage: build.query<MessagingUsage, undefined>({
      query: () => '/messaging/usage',
      transformResponse: (raw: unknown) => ({
        pending: readNumber(raw, 'pending') ?? 0,
        delivered: readNumber(raw, 'delivered') ?? 0,
        failed: readNumber(raw, 'failed') ?? 0,
        cancelled: readNumber(raw, 'cancelled') ?? 0,
        providerConfigured: read(raw, 'providerConfigured') !== false,
      }),
      providesTags: [{ type: 'Message', id: 'USAGE' }],
    }),
    sendDirectMessage: build.mutation<
      undefined,
      { studentId: string; channel: 'WhatsApp' | 'Sms'; body: string }
    >({
      query: (body) => ({ url: '/messages/direct', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: [
        { type: 'Message', id: 'LIST' },
        { type: 'Message', id: 'USAGE' },
      ],
    }),

    duplicateGroup: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/groups/${encodeURIComponent(id)}/duplicate`, method: 'POST' }),
      transformResponse: (raw: unknown) => ({ id: readString(raw, 'id') ?? '' }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }],
    }),
    generateSessions: build.mutation<
      { created: number },
      { id: string; fromDate: string; days: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/groups/${encodeURIComponent(id)}/generate-sessions`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => ({
        created: readNumber(raw, 'created', 'count', 'generated') ?? 0,
      }),
      invalidatesTags: ['Session', 'Dashboard'],
    }),
    getRecurrence: build.query<Recurrence, string>({
      query: (id) => `/groups/${encodeURIComponent(id)}/recurrence`,
      transformResponse: (raw: unknown) => ({
        enabled: read(raw, 'enabled') === true,
        startsOn: readString(raw, 'startsOn'),
        endsOn: readString(raw, 'endsOn'),
        horizonDays: readNumber(raw, 'horizonDays') ?? 14,
        nextRefreshAt: readString(raw, 'nextRefreshAtUtc'),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Group', id: `REC-${id}` }],
    }),
    setRecurrence: build.mutation<
      undefined,
      { id: string; enabled: boolean; startsOn: string; endsOn: string | null; horizonDays: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/groups/${encodeURIComponent(id)}/recurrence`,
        method: 'PUT',
        body,
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Group', id: `REC-${id}` }, 'Session'],
    }),

    cancelMaterialRecord: build.mutation<
      undefined,
      {
        kind: 'stock-movements' | 'material-deliveries';
        id: string;
        materialId: string;
        reason: string;
      }
    >({
      query: ({ kind, id, reason }) => ({
        url: `/${kind}/${encodeURIComponent(id)}`,
        method: 'DELETE',
        params: { reason },
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { materialId }) => [
        { type: 'Material', id: materialId },
        { type: 'Material', id: `MOVES-${materialId}` },
        { type: 'Material', id: `DELIVERIES-${materialId}` },
        { type: 'Material', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useImportQuestionsMutation,
  useGetMessagingUsageQuery,
  useSendDirectMessageMutation,
  useDuplicateGroupMutation,
  useGenerateSessionsMutation,
  useGetRecurrenceQuery,
  useSetRecurrenceMutation,
  useCancelMaterialRecordMutation,
} = api3;
