import { api } from '@/services/api';
import { read, readNumber, readString, warnShape } from '@/services/normalize';

/** Sessions — live API: GET /sessions?from&to&groupId, POST /sessions/{id}/postpone|cancel. */
export type SessionKind = 'Regular' | 'Extra' | 'Review' | 'Makeup';
export type SessionState = 'Scheduled' | 'Live' | 'Done' | 'Cancelled' | 'Postponed';

export interface SessionDto {
  id: string;
  groupId: string | null;
  groupName: string;
  hallName: string | null;
  /** ISO UTC */
  startsAt: string;
  durationMinutes: number;
  kind: SessionKind;
  status: SessionState;
  topic: string | null;
}

const KINDS: readonly SessionKind[] = ['Regular', 'Extra', 'Review', 'Makeup'];
const STATUS: Record<string, SessionState> = {
  scheduled: 'Scheduled',
  upcoming: 'Scheduled',
  planned: 'Scheduled',
  live: 'Live',
  inprogress: 'Live',
  open: 'Live',
  done: 'Done',
  completed: 'Done',
  closed: 'Done',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  postponed: 'Postponed',
};

function normalizeSession(raw: unknown, index: number): SessionDto {
  const kind = readString(raw, 'kind', 'type')?.toLowerCase();
  const status =
    readString(raw, 'status', 'state')
      ?.replace(/[\s_-]/g, '')
      .toLowerCase() ?? '';
  return {
    id: readString(raw, 'id', 'sessionId') ?? `session-${index}`,
    groupId: readString(raw, 'groupId', 'group.id'),
    groupName: readString(raw, 'groupName', 'group.name', 'title') ?? '—',
    hallName: readString(raw, 'hallName', 'hall.name'),
    startsAt: readString(raw, 'startsAtUtc', 'startsAt', 'start') ?? '',
    durationMinutes: readNumber(raw, 'durationMinutes', 'duration') ?? 90,
    kind: KINDS.find((item) => item.toLowerCase() === kind) ?? 'Regular',
    status: STATUS[status] ?? 'Scheduled',
    topic: readString(raw, 'topic'),
  };
}

function normalizeSessions(raw: unknown): SessionDto[] {
  const list = Array.isArray(raw) ? raw : read(raw, 'items', 'data', 'sessions');
  if (!Array.isArray(list)) {
    warnShape('sessions', raw);
    return [];
  }
  return list.map(normalizeSession).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export interface SessionsRange {
  /** YYYY-MM-DD */
  from: string;
  to: string;
  groupId?: string;
}

const sessionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSessions: build.query<SessionDto[], SessionsRange>({
      query: (range) => ({ url: '/sessions', params: range }),
      transformResponse: normalizeSessions,
      providesTags: [{ type: 'Session', id: 'LIST' }],
    }),
    postponeSession: build.mutation<
      undefined,
      { id: string; startsAtUtc: string; reason: string; notify: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/sessions/${encodeURIComponent(id)}/postpone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }, 'Dashboard'],
    }),
    cancelSession: build.mutation<undefined, { id: string; reason: string; notify: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/sessions/${encodeURIComponent(id)}/cancel`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const { useGetSessionsQuery, usePostponeSessionMutation, useCancelSessionMutation } =
  sessionsApi;
