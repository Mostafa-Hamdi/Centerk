import { api } from '@/services/api';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Centers — hall rental (/hall-bookings, UTC times) and teacher settlements (/settlements). */
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

export interface SettlementDto {
  id: string;
  teacherId: string | null;
  month: string;
  grossCollected: number;
  centerShare: number;
  netToTeacher: number;
  status: string;
  disputeNote: string | null;
  paidAt: string | null;
}

const normalizeSettlement = (raw: unknown, index = 0): SettlementDto => ({
  id: readString(raw, 'id') ?? `settlement-${index}`,
  teacherId: readString(raw, 'teacherId'),
  month: readString(raw, 'month') ?? '—',
  grossCollected: readNumber(raw, 'grossCollected') ?? 0,
  centerShare: readNumber(raw, 'centerShare') ?? 0,
  netToTeacher: readNumber(raw, 'netToTeacher') ?? 0,
  status: readString(raw, 'status') ?? 'Pending',
  disputeNote: readString(raw, 'disputeNote'),
  paidAt: readString(raw, 'paidAtUtc'),
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
    getSettlements: build.query<Paged<SettlementDto>, ListParams & { month: string }>({
      query: ({ month, ...params }) => ({
        url: '/settlements',
        params: { ...toQueryParams(params), month },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeSettlement, params, 'settlements'),
      providesTags: [{ type: 'Settlement', id: 'LIST' }],
    }),
    /** POST /settlements/generate?month= — teachers without an agreement are skipped. */
    generateSettlements: build.mutation<{ created: number; skipped: number }, string>({
      query: (month) => ({ url: '/settlements/generate', method: 'POST', params: { month } }),
      transformResponse: (raw: unknown) => {
        const skipped = read(raw, 'skippedWithoutAgreement');
        return {
          created: readNumber(raw, 'created') ?? 0,
          skipped: Array.isArray(skipped) ? skipped.length : 0,
        };
      },
      invalidatesTags: [{ type: 'Settlement', id: 'LIST' }],
    }),
    settlementAction: build.mutation<
      undefined,
      | { id: string; action: 'pay'; branchId?: string; cashShiftId?: string }
      | { id: string; action: 'dispute'; reason: string }
    >({
      query: (arg) =>
        arg.action === 'pay'
          ? {
              url: `/settlements/${encodeURIComponent(arg.id)}/pay`,
              method: 'POST',
              body: { branchId: arg.branchId, cashShiftId: arg.cashShiftId },
            }
          : {
              url: `/settlements/${encodeURIComponent(arg.id)}/dispute`,
              method: 'POST',
              body: { reason: arg.reason },
            },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Settlement', id: 'LIST' }, 'Expense', 'CashShift', 'Dashboard'],
    }),
  }),
});

export const {
  useGetSettlementsQuery,
  useGenerateSettlementsMutation,
  useSettlementActionMutation,
  useGetHallBookingsQuery,
  useCreateHallBookingMutation,
  useCancelHallBookingMutation,
} = centersApi;
