import { api } from '@/services/api';
import { normalizePaged, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Hall rental for external teachers — live /hall-bookings (BookingRequest, UTC times). */
export interface HallBookingDto {
  id: string;
  hallId: string | null;
  teacherId: string | null;
  groupId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
}

const normalizeBooking = (raw: unknown, index = 0): HallBookingDto => ({
  id: readString(raw, 'id') ?? `booking-${index}`,
  hallId: readString(raw, 'hallId'),
  teacherId: readString(raw, 'teacherId'),
  groupId: readString(raw, 'groupId'),
  startsAt: readString(raw, 'startsAtUtc'),
  endsAt: readString(raw, 'endsAtUtc'),
  status: readString(raw, 'status') ?? 'Booked',
});

const centersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHallBookings: build.query<Paged<HallBookingDto>, ListParams & { hallId?: string }>({
      query: ({ hallId, ...params }) => ({
        url: '/hall-bookings',
        params: { ...toQueryParams(params), ...(hallId ? { hallId } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeBooking, params, 'hall-bookings'),
      providesTags: [{ type: 'HallBooking', id: 'LIST' }],
    }),
    createHallBooking: build.mutation<
      HallBookingDto,
      { hallId: string; teacherId: string; startsAtUtc: string; endsAtUtc: string }
    >({
      query: (body) => ({ url: '/hall-bookings', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeBooking(raw),
      invalidatesTags: [{ type: 'HallBooking', id: 'LIST' }],
    }),
    cancelHallBooking: build.mutation<undefined, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/hall-bookings/${encodeURIComponent(id)}`,
        method: 'DELETE',
        params: { reason },
      }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'HallBooking', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetHallBookingsQuery,
  useCreateHallBookingMutation,
  useCancelHallBookingMutation,
} = centersApi;
