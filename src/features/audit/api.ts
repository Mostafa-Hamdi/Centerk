import { api } from '@/services/api';
import { normalizePaged, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Audit log — live GET /audit-logs (filters: action, entityType, from, to) and /audit-logs/{id}. */
export interface AuditEntryDto {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  occurredAt: string | null;
}

const normalizeEntry = (raw: unknown, index = 0): AuditEntryDto => ({
  id: readString(raw, 'id') ?? `audit-${index}`,
  actorId: readString(raw, 'actorId'),
  actorName: readString(raw, 'actorName', 'actor.name'),
  action: readString(raw, 'action') ?? '—',
  entityType: readString(raw, 'entityType') ?? '—',
  entityId: readString(raw, 'entityId'),
  oldValue: readString(raw, 'oldValue'),
  newValue: readString(raw, 'newValue'),
  reason: readString(raw, 'reason'),
  occurredAt: readString(raw, 'occurredAtUtc'),
});

export interface AuditParams extends ListParams {
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

const auditApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogs: build.query<Paged<AuditEntryDto>, AuditParams>({
      query: ({ action, entityType, from, to, ...params }) => ({
        url: '/audit-logs',
        params: {
          ...toQueryParams(params),
          ...(action ? { action } : {}),
          ...(entityType ? { entityType } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeEntry, params, 'audit-logs'),
      providesTags: [{ type: 'AuditLog', id: 'LIST' }],
    }),
    getAuditEntry: build.query<AuditEntryDto, string>({
      query: (id) => `/audit-logs/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeEntry(raw),
      providesTags: (_result, _error, id) => [{ type: 'AuditLog', id }],
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetAuditEntryQuery } = auditApi;

/** Pretty-prints a JSON snapshot; non-JSON values pass through. */
export function prettyJson(value: string | null): string {
  if (!value) return '—';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
