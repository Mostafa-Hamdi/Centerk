import { api } from '@/services/api';
import type { NewStaffV1, StaffAttendanceRequest } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Staff, staff attendance & payroll — live /staff, /staff-attendance, /payrolls. */
type NonNull<T> = Exclude<T, null>;
export type StaffRole = NonNull<NewStaffV1['role']>;
export type StaffAttendanceStatus = NonNull<StaffAttendanceRequest['status']>;
export const STAFF_ROLES: readonly StaffRole[] = [
  'BranchManager',
  'Teacher',
  'Assistant',
  'Receptionist',
  'Accountant',
];
export const STAFF_ATTENDANCE_STATUSES: readonly StaffAttendanceStatus[] = [
  'Present',
  'Late',
  'Absent',
  'Leave',
];

export interface StaffDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  branchId: string | null;
  isActive: boolean;
}

export interface StaffAttendanceDto {
  id: string;
  userId: string | null;
  date: string | null;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export interface PayrollDto {
  id: string;
  userId: string | null;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  net: number;
  status: string;
  paidAt: string | null;
}

export interface StaffInput {
  name: string;
  phone: string;
  email: string | null;
  role: StaffRole;
  branchId?: string | null;
}

const normalizeStaff = (raw: unknown, index = 0): StaffDto => ({
  id: readString(raw, 'id', 'userId') ?? `staff-${index}`,
  name: readString(raw, 'name', 'fullName') ?? '—',
  phone: readString(raw, 'phone'),
  email: readString(raw, 'email'),
  role: readString(raw, 'role') ?? '—',
  branchId: readString(raw, 'branchId'),
  isActive: read(raw, 'isActive') !== false,
});

const normalizeAttendance = (raw: unknown, index: number): StaffAttendanceDto => ({
  id: readString(raw, 'id') ?? `staff-attendance-${index}`,
  userId: readString(raw, 'userId'),
  date: readString(raw, 'date'),
  checkIn: readString(raw, 'checkIn'),
  checkOut: readString(raw, 'checkOut'),
  status: readString(raw, 'status') ?? '—',
});

const normalizePayroll = (raw: unknown, index = 0): PayrollDto => {
  const baseSalary = readNumber(raw, 'baseSalary') ?? 0;
  const bonus = readNumber(raw, 'bonus') ?? 0;
  const deductions = readNumber(raw, 'deductions') ?? 0;
  return {
    id: readString(raw, 'id') ?? `payroll-${index}`,
    userId: readString(raw, 'userId'),
    month: readString(raw, 'month') ?? '—',
    baseSalary,
    bonus,
    deductions,
    net: readNumber(raw, 'net') ?? baseSalary + bonus - deductions,
    status: readString(raw, 'status') ?? 'Pending',
    paidAt: readString(raw, 'paidAtUtc'),
  };
};

export const isPaid = (payroll: PayrollDto) =>
  Boolean(payroll.paidAt) || payroll.status.toLowerCase() === 'paid';

const staffApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStaff: build.query<Paged<StaffDto>, ListParams & { role?: StaffRole }>({
      query: ({ role, ...params }) => ({
        url: '/staff',
        params: { ...toQueryParams(params), includeInactive: true, ...(role ? { role } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeStaff, params, 'staff'),
      providesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    getStaffMember: build.query<StaffDto, string>({
      query: (id) => `/staff/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeStaff(raw),
      providesTags: (_result, _error, id) => [{ type: 'Staff', id }],
    }),
    saveStaff: build.mutation<StaffDto, StaffInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/staff/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/staff', method: 'POST', body },
      transformResponse: (raw: unknown) => normalizeStaff(raw),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Staff', id: 'LIST' },
        ...(id ? [{ type: 'Staff' as const, id }] : []),
      ],
    }),
    staffAction: build.mutation<
      undefined,
      { id: string; action: 'suspend' | 'activate' | 'delete' }
    >({
      query: ({ id, action }) =>
        action === 'delete'
          ? { url: `/staff/${encodeURIComponent(id)}`, method: 'DELETE' }
          : { url: `/staff/${encodeURIComponent(id)}/${action}`, method: 'POST' },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Staff', id: 'LIST' },
        { type: 'Staff', id },
      ],
    }),

    getStaffAttendance: build.query<Paged<StaffAttendanceDto>, ListParams & { date: string }>({
      query: ({ date, ...params }) => ({
        url: '/staff-attendance',
        params: { ...toQueryParams(params), date },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeAttendance, params, 'staff-attendance'),
      providesTags: [{ type: 'Staff', id: 'ATTENDANCE' }],
    }),
    recordStaffAttendance: build.mutation<
      undefined,
      {
        userId: string;
        date: string;
        status: StaffAttendanceStatus;
        checkIn: string | null;
        checkOut: string | null;
      }
    >({
      query: (body) => ({ url: '/staff-attendance', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Staff', id: 'ATTENDANCE' }],
    }),
    deleteStaffAttendance: build.mutation<undefined, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/staff-attendance/${encodeURIComponent(id)}`,
        method: 'DELETE',
        params: { reason },
      }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Staff', id: 'ATTENDANCE' }],
    }),

    getPayrolls: build.query<Paged<PayrollDto>, ListParams & { month: string }>({
      query: ({ month, ...params }) => ({
        url: '/payrolls',
        params: { ...toQueryParams(params), month },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizePayroll, params, 'payrolls'),
      providesTags: [{ type: 'Payroll', id: 'LIST' }],
    }),
    createPayroll: build.mutation<
      PayrollDto,
      { userId: string; month: string; baseSalary: number; bonus: number; deductions: number }
    >({
      query: (body) => ({ url: '/payrolls', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizePayroll(raw),
      invalidatesTags: [{ type: 'Payroll', id: 'LIST' }],
    }),
    /** POST /payrolls/{id}/pay — pays from the drawer (creates an expense on the open shift). */
    payPayroll: build.mutation<undefined, { id: string; branchId?: string; cashShiftId?: string }>({
      query: ({ id, ...body }) => ({
        url: `/payrolls/${encodeURIComponent(id)}/pay`,
        method: 'POST',
        body,
      }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Payroll', id: 'LIST' }, 'Expense', 'CashShift', 'Dashboard'],
    }),
    deletePayroll: build.mutation<undefined, string>({
      query: (id) => ({ url: `/payrolls/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Payroll', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffMemberQuery,
  useSaveStaffMutation,
  useStaffActionMutation,
  useGetStaffAttendanceQuery,
  useRecordStaffAttendanceMutation,
  useDeleteStaffAttendanceMutation,
  useGetPayrollsQuery,
  useCreatePayrollMutation,
  usePayPayrollMutation,
  useDeletePayrollMutation,
} = staffApi;
