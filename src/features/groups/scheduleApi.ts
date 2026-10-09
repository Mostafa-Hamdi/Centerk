import { api } from '@/services/api';
import type { WeeklySlotDto } from './types';

/** PUT /groups/{id}/schedule — replaces the whole weekly schedule (dayOfWeek 0 = Sunday). */
const scheduleApi = api.injectEndpoints({
  endpoints: (build) => ({
    replaceSchedule: build.mutation<undefined, { id: string; slots: WeeklySlotDto[] }>({
      query: ({ id, slots }) => ({
        url: `/groups/${encodeURIComponent(id)}/schedule`,
        method: 'PUT',
        body: slots.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime,
          durationMinutes: slot.durationMinutes,
          ...(slot.hallId ? { hallId: slot.hallId } : {}),
        })),
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Group', id },
        { type: 'Group', id: 'LIST' },
        'Session',
        'Dashboard',
      ],
    }),
  }),
});

export const { useReplaceScheduleMutation } = scheduleApi;
