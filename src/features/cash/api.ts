import { api } from '@/services/api';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Cash drawer & expenses — live /cash-shifts, /expenses, /expense-categories (Swagger CashShift, Expense). */
export interface CashShiftDto {
  id: string;
  branchId: string | null;
  userId: string | null;
  openedAt: string | null;
  closedAt: string | null;
  openingBalance: number;
  expectedCash: number | null;
  countedCash: number | null;
  variance: number | null;
  varianceReason: string | null;
}

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';
export const EXPENSE_STATUSES: readonly ExpenseStatus[] = ['Pending', 'Approved', 'Rejected'];

export interface ExpenseDto {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  status: ExpenseStatus;
  cashShiftId: string | null;
  createdAt: string | null;
}

export interface ExpenseCategoryDto {
  id: string;
  name: string;
  isActive: boolean;
}

function normalizeShift(raw: unknown, index = 0): CashShiftDto {
  const source = read(raw, 'shift') ?? raw;
  return {
    id: readString(source, 'id') ?? `shift-${index}`,
    branchId: readString(source, 'branchId'),
    userId: readString(source, 'userId'),
    openedAt: readString(source, 'openedAtUtc'),
    closedAt: readString(source, 'closedAtUtc'),
    openingBalance: readNumber(source, 'openingBalance') ?? 0,
    expectedCash: readNumber(source, 'expectedCash'),
    countedCash: readNumber(source, 'countedCash'),
    variance: readNumber(source, 'variance'),
    varianceReason: readString(source, 'varianceReason'),
  };
}

function normalizeExpense(raw: unknown, index: number): ExpenseDto {
  const status = readString(raw, 'status')?.toLowerCase();
  return {
    id: readString(raw, 'id') ?? `expense-${index}`,
    category: readString(raw, 'category', 'categoryName') ?? '—',
    description: readString(raw, 'description'),
    amount: readNumber(raw, 'amount') ?? 0,
    status: status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending',
    cashShiftId: readString(raw, 'cashShiftId'),
    createdAt: readString(raw, 'createdAtUtc'),
  };
}

export interface ExpensesParams extends ListParams {
  status?: ExpenseStatus;
}

export interface NewExpense {
  branchId?: string;
  cashShiftId?: string;
  category: string;
  description: string;
  amount: number;
}

const cashApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** No open shift → null (the API answers 404/204 or an empty body). */
    getCurrentShift: build.query<CashShiftDto | null, undefined>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery('/cash-shifts/current');
        if (result.error) {
          return result.error.status === 404 ? { data: null } : { error: result.error };
        }
        return { data: readString(result.data, 'id') ? normalizeShift(result.data) : null };
      },
      providesTags: [{ type: 'CashShift', id: 'CURRENT' }],
    }),
    getShifts: build.query<Paged<CashShiftDto>, ListParams>({
      query: (params) => ({ url: '/cash-shifts', params: toQueryParams(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeShift, params, 'cash-shifts'),
      providesTags: [{ type: 'CashShift', id: 'LIST' }],
    }),
    openShift: build.mutation<CashShiftDto, { branchId?: string; openingBalance: number }>({
      query: (body) => ({ url: '/cash-shifts/open', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeShift(raw),
      invalidatesTags: ['CashShift'],
    }),
    closeShift: build.mutation<
      CashShiftDto,
      { id: string; countedCash: number; varianceReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/cash-shifts/${encodeURIComponent(id)}/close`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => normalizeShift(raw),
      invalidatesTags: ['CashShift', 'Dashboard'],
    }),

    getExpenses: build.query<Paged<ExpenseDto>, ExpensesParams>({
      query: ({ status, ...params }) => ({
        url: '/expenses',
        params: { ...toQueryParams(params), ...(status ? { status } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeExpense, params, 'expenses'),
      providesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
    getExpense: build.query<ExpenseDto, string>({
      query: (id) => `/expenses/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeExpense(raw, 0),
      providesTags: (_result, _error, id) => [{ type: 'Expense', id }],
    }),
    updateExpense: build.mutation<ExpenseDto, NewExpense & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/expenses/${encodeURIComponent(id)}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (raw: unknown) => normalizeExpense(raw, 0),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        { type: 'CashShift', id: 'CURRENT' },
      ],
    }),
    createExpense: build.mutation<ExpenseDto, NewExpense>({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeExpense(raw, 0),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'CashShift', id: 'CURRENT' },
      ],
    }),
    reviewExpense: build.mutation<ExpenseDto, { id: string; decision: 'approve' | 'reject' }>({
      query: ({ id, decision }) => ({
        url: `/expenses/${encodeURIComponent(id)}/${decision}`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => normalizeExpense(raw, 0),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'CashShift', id: 'CURRENT' },
      ],
    }),
    deleteExpense: build.mutation<undefined, string>({
      query: (id) => ({ url: `/expenses/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'CashShift', id: 'CURRENT' },
      ],
    }),
    getExpenseCategories: build.query<ExpenseCategoryDto[], undefined>({
      query: () => ({ url: '/expense-categories', params: { page: 1, pageSize: 100 } }),
      transformResponse: (raw: unknown) => {
        const items = read(raw, 'items') ?? raw;
        return Array.isArray(items)
          ? (items as unknown[])
              .map((item, index) => ({
                id: readString(item, 'id') ?? `category-${index}`,
                name: readString(item, 'name') ?? '',
                isActive: read(item, 'isActive') !== false,
              }))
              .filter((category) => category.name && category.isActive)
          : [];
      },
      providesTags: [{ type: 'Expense', id: 'CATEGORIES' }],
    }),
  }),
});

export const {
  useGetCurrentShiftQuery,
  useGetShiftsQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetExpenseQuery,
  useUpdateExpenseMutation,
  useReviewExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseCategoriesQuery,
} = cashApi;
