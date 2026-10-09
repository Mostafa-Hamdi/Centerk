import { api } from '@/services/api';
import type { NewPaymentV1 } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Payments & receipts — live /payments, /charges, /dues (Swagger Payment, Charge, dues rows). */
export type PaymentMethod = 'Cash' | 'VodafoneCash' | 'InstaPay' | 'Card' | 'Fawry';
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'Cash',
  'VodafoneCash',
  'InstaPay',
  'Card',
  'Fawry',
];

export interface PaymentDto {
  id: string;
  receiptNumber: string;
  amount: number;
  method: string;
  status: 'Active' | 'Voided';
  collectedAt: string | null;
  referenceNo: string | null;
  notes: string | null;
  voidReason: string | null;
  studentId: string | null;
  studentName: string | null;
  studentCode: string | null;
}

export interface PaymentDetailsDto extends PaymentDto {
  allocations: { chargeId: string; amount: number }[];
}

export interface ChargeDto {
  id: string;
  period: string | null;
  amount: number;
  createdAt: string | null;
}

export interface DueDto {
  studentId: string;
  studentName: string;
  code: string | null;
  amount: number;
  overdueDays: number;
}

function normalizePayment(raw: unknown, index: number): PaymentDto {
  const status = readString(raw, 'status')?.toLowerCase();
  return {
    id: readString(raw, 'id') ?? `payment-${index}`,
    receiptNumber: readString(raw, 'receiptNumber') ?? '—',
    amount: readNumber(raw, 'amount') ?? 0,
    method: readString(raw, 'method') ?? 'Cash',
    status: status === 'voided' || status === 'void' ? 'Voided' : 'Active',
    collectedAt: readString(raw, 'collectedAtUtc', 'createdAtUtc'),
    referenceNo: readString(raw, 'referenceNo'),
    notes: readString(raw, 'notes'),
    voidReason: readString(raw, 'voidReason'),
    studentId: readString(raw, 'studentId', 'student.id'),
    studentName: readString(raw, 'studentName', 'student.fullName'),
    studentCode: readString(raw, 'studentCode', 'student.code'),
  };
}

function normalizePaymentDetails(raw: unknown): PaymentDetailsDto {
  const allocations = read(raw, 'allocations');
  return {
    ...normalizePayment(read(raw, 'payment') ?? raw, 0),
    studentId: readString(raw, 'studentId', 'payment.studentId'),
    studentName: readString(raw, 'studentName', 'student.fullName'),
    allocations: Array.isArray(allocations)
      ? (allocations as unknown[]).map((item) => ({
          chargeId: readString(item, 'chargeId') ?? '',
          amount: readNumber(item, 'amount') ?? 0,
        }))
      : [],
  };
}

export interface PaymentsParams extends ListParams {
  date?: string;
}

const paymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPayments: build.query<Paged<PaymentDto>, PaymentsParams>({
      query: ({ date, ...params }) => ({
        url: '/payments',
        params: { ...toQueryParams(params), ...(date ? { date } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizePayment, params, 'payments'),
      providesTags: [{ type: 'Payment', id: 'LIST' }],
    }),
    getPayment: build.query<PaymentDetailsDto, string>({
      query: (id) => `/payments/${encodeURIComponent(id)}`,
      transformResponse: normalizePaymentDetails,
      providesTags: (_result, _error, id) => [{ type: 'Payment', id }],
    }),
    getStudentCharges: build.query<ChargeDto[], string>({
      query: (studentId) => ({ url: '/charges', params: { studentId } }),
      transformResponse: (raw: unknown) =>
        Array.isArray(raw)
          ? (raw as unknown[]).map((item, index) => ({
              id: readString(item, 'id') ?? `charge-${index}`,
              period: readString(item, 'period'),
              amount: readNumber(item, 'amount') ?? 0,
              createdAt: readString(item, 'createdAtUtc'),
            }))
          : [],
      providesTags: (_result, _error, studentId) => [{ type: 'Due', id: studentId }],
    }),
    /** POST /payments with Idempotency-Key (spec §18); the key is generated once per submit. */
    collectPayment: build.mutation<
      { id: string; receiptNumber: string },
      Omit<NewPaymentV1, 'idempotencyKey'>
    >({
      query: (body) => {
        const key = crypto.randomUUID();
        return {
          url: '/payments',
          method: 'POST',
          headers: { 'Idempotency-Key': key },
          body: { ...body, idempotencyKey: key },
        };
      },
      transformResponse: (raw: unknown) => ({
        id: readString(raw, 'id') ?? '',
        receiptNumber: readString(raw, 'receiptNumber') ?? '',
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }, 'Due', 'Dashboard', 'Student'],
    }),
    voidPayment: build.mutation<undefined, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/payments/${encodeURIComponent(id)}/void`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Payment', id },
        { type: 'Payment', id: 'LIST' },
        'Due',
        'Dashboard',
      ],
    }),
    getDues: build.query<Paged<DueDto>, ListParams>({
      query: (params) => ({ url: '/dues', params: toQueryParams(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(
          raw,
          (item, index): DueDto => ({
            studentId: readString(item, 'studentId', 'student.id') ?? `due-${index}`,
            studentName: readString(item, 'student.fullName', 'studentName') ?? '—',
            code: readString(item, 'student.code', 'code'),
            amount: readNumber(item, 'amount') ?? 0,
            overdueDays: readNumber(item, 'overdueDays') ?? 0,
          }),
          params,
          'dues',
        ),
      providesTags: ['Due'],
    }),
    remindDue: build.mutation<undefined, string>({
      query: (studentId) => ({
        url: `/dues/${encodeURIComponent(studentId)}/remind`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useGetStudentChargesQuery,
  useCollectPaymentMutation,
  useVoidPaymentMutation,
  useGetDuesQuery,
  useRemindDueMutation,
} = paymentsApi;

/** FIFO allocation of an amount over open charges (oldest first) — backend-spec §9.5. */
export function allocateFifo(
  amount: number,
  charges: readonly ChargeDto[],
): { feeChargeId: string; amount: number }[] {
  let remaining = amount;
  const sorted = [...charges].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  const allocations: { feeChargeId: string; amount: number }[] = [];
  for (const charge of sorted) {
    if (remaining <= 0) break;
    const part = Math.min(remaining, charge.amount);
    if (part > 0)
      allocations.push({ feeChargeId: charge.id, amount: Math.round(part * 100) / 100 });
    remaining -= part;
  }
  return allocations;
}
