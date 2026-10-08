import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

/** One tag per entity; modules inject endpoints with `api.injectEndpoints` in features/<module>/api.ts. */
export const tagTypes = [
  'Me',
  'Dashboard',
  'Student',
  'Guardian',
  'Group',
  'Session',
  'Hall',
  'Attendance',
  'Quiz',
  'Question',
  'OnlineExam',
  'Payment',
  'Due',
  'CashShift',
  'Expense',
  'Material',
  'Message',
  'Campaign',
  'MessageTemplate',
  'AutomationRule',
  'Video',
  'Assignment',
  'Course',
  'Staff',
  'Payroll',
  'Role',
  'AuditLog',
  'Report',
  'ScheduledReport',
  'Settings',
  'Branch',
  'HallBooking',
  'Teacher',
  'Settlement',
] as const;

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes,
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

/**
 * Fresh Idempotency-Key — only for the POSTs listed in backend-spec §18
 * (payments, attendance scan, campaign send-now, online payment intent).
 * Generate it inside `query()` so a reauth retry reuses the same key.
 */
export const idempotencyHeaders = () => ({ 'Idempotency-Key': crypto.randomUUID() });
