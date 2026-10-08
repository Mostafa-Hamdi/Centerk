import { api } from '@/services/api';
import { read, readNumber, readString, warnShape } from '@/services/normalize';

/**
 * Attendance — live API: GET /sessions/{id}/attendance, POST /attendance/scan,
 * POST /sessions/{id}/attendance/manual, POST /sessions/{id}/close. Responses are untyped →
 * normalized here (aliases per backend-spec §9.3 / §16).
 */
export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';

export interface AttendanceRecordDto {
  id: string;
  studentId: string;
  studentName: string;
  code: string | null;
  status: AttendanceStatus;
  checkedInAt: string | null;
}

export interface RosterStudentDto {
  studentId: string;
  fullName: string;
  code: string | null;
  balance: number;
  blocked: boolean;
}

export interface SessionAttendanceDto {
  sessionId: string;
  groupName: string;
  startsAt: string | null;
  closed: boolean;
  counters: { present: number; late: number; absent: number; excused: number; expected: number };
  records: AttendanceRecordDto[];
  notRecorded: RosterStudentDto[];
}

/** Colour of the scan result panel. */
export type ScanTone = 'success' | 'warning' | 'danger' | 'info';

export interface ScanResult {
  tone: ScanTone;
  studentName: string | null;
  outcome: string;
  balance: number | null;
  /** Set when the API refused because the student is blocked (override possible). */
  blocked: boolean;
}

const STATUSES: readonly AttendanceStatus[] = ['Present', 'Late', 'Absent', 'Excused'];
const toStatus = (value: string | null) =>
  STATUSES.find((status) => status.toLowerCase() === value?.toLowerCase()) ?? 'Present';

function normalizeAttendance(raw: unknown): SessionAttendanceDto {
  const records = read(raw, 'records', 'items', 'attendance');
  const pending = read(raw, 'notRecorded', 'notYetRecorded', 'roster', 'pending');
  if (!Array.isArray(records)) warnShape('sessions/{id}/attendance', raw);
  const recordList = Array.isArray(records)
    ? records.map((record, index): AttendanceRecordDto => ({
        id: readString(record, 'id', 'recordId') ?? `record-${index}`,
        studentId: readString(record, 'studentId', 'student.id') ?? '',
        studentName: readString(record, 'studentName', 'student.fullName', 'fullName') ?? '—',
        code: readString(record, 'code', 'studentCode', 'student.code'),
        status: toStatus(readString(record, 'status')),
        checkedInAt: readString(record, 'checkedInAt', 'checkedInAtUtc', 'scannedAt'),
      }))
    : [];
  const count = (status: AttendanceStatus) =>
    recordList.filter((record) => record.status === status).length;
  const notRecorded = Array.isArray(pending)
    ? pending.map((student, index): RosterStudentDto => ({
        studentId: readString(student, 'studentId', 'id') ?? `student-${index}`,
        fullName: readString(student, 'fullName', 'studentName', 'name') ?? '—',
        code: readString(student, 'code', 'studentCode'),
        balance: readNumber(student, 'balance', 'openBalance') ?? 0,
        blocked: read(student, 'blocked', 'isBlocked') === true,
      }))
    : [];
  return {
    sessionId: readString(raw, 'sessionId', 'session.id', 'id') ?? '',
    groupName: readString(raw, 'groupName', 'session.groupName', 'group.name') ?? '',
    startsAt: readString(raw, 'startsAtUtc', 'session.startsAtUtc', 'startsAt'),
    closed:
      read(raw, 'closed', 'isClosed', 'session.isClosed') === true ||
      readString(raw, 'status', 'session.status')?.toLowerCase() === 'closed',
    counters: {
      present: readNumber(raw, 'counters.present', 'presentCount') ?? count('Present'),
      late: readNumber(raw, 'counters.late', 'lateCount') ?? count('Late'),
      absent: readNumber(raw, 'counters.absent', 'absentCount') ?? count('Absent'),
      excused: readNumber(raw, 'counters.excused', 'excusedCount') ?? count('Excused'),
      expected:
        readNumber(raw, 'counters.expected', 'expectedCount', 'enrolledCount') ??
        recordList.length + notRecorded.length,
    },
    records: recordList,
    notRecorded,
  };
}

/** Maps the scan response (untyped) to a coloured result. */
export function normalizeScan(raw: unknown): ScanResult {
  const outcome = (readString(raw, 'outcome', 'result', 'status') ?? 'Recorded').toLowerCase();
  const balance = readNumber(raw, 'balance', 'openBalance', 'student.balance');
  const late =
    outcome.includes('late') ||
    readString(raw, 'attendanceStatus', 'record.status')?.toLowerCase() === 'late';
  const already = outcome.includes('already') || outcome.includes('duplicate');
  const tone: ScanTone = already ? 'info' : late || (balance ?? 0) > 0 ? 'warning' : 'success';
  return {
    tone,
    studentName: readString(raw, 'studentName', 'student.fullName', 'fullName'),
    outcome: already ? 'already' : late ? 'late' : (balance ?? 0) > 0 ? 'warning' : 'present',
    balance,
    blocked: false,
  };
}

export interface ScanRequest {
  sessionId: string;
  code?: string;
  qrToken?: string;
  override?: boolean;
  overrideReason?: string;
}

const attendanceApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSessionAttendance: build.query<SessionAttendanceDto, string>({
      query: (sessionId) => `/sessions/${encodeURIComponent(sessionId)}/attendance`,
      transformResponse: normalizeAttendance,
      providesTags: (_result, _error, sessionId) => [{ type: 'Attendance', id: sessionId }],
      keepUnusedDataFor: 30,
    }),
    scanAttendance: build.mutation<ScanResult, ScanRequest>({
      // Idempotency-Key per backend-spec §18; clientRecordId lets offline sync dedupe later.
      query: (body) => {
        const key = crypto.randomUUID();
        return {
          url: '/attendance/scan',
          method: 'POST',
          headers: { 'Idempotency-Key': key },
          body: {
            ...body,
            clientRecordId: key,
            scannedAt: new Date().toISOString(),
            deviceId: 'web',
          },
        };
      },
      transformResponse: normalizeScan,
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'Attendance', id: sessionId },
        'Dashboard',
      ],
    }),
    markAttendance: build.mutation<
      undefined,
      { sessionId: string; studentId: string; status: AttendanceStatus; reason: string }
    >({
      query: ({ sessionId, ...body }) => ({
        url: `/sessions/${encodeURIComponent(sessionId)}/attendance/manual`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'Attendance', id: sessionId },
        'Dashboard',
      ],
    }),
    closeAttendanceSession: build.mutation<undefined, { sessionId: string; notifyAbsent: boolean }>(
      {
        query: ({ sessionId, notifyAbsent }) => ({
          url: `/sessions/${encodeURIComponent(sessionId)}/close`,
          method: 'POST',
          body: { notifyAbsent },
        }),
        invalidatesTags: (_result, _error, { sessionId }) => [
          { type: 'Attendance', id: sessionId },
          { type: 'Session', id: 'LIST' },
          'Dashboard',
        ],
      },
    ),
  }),
});

export const {
  useGetSessionAttendanceQuery,
  useScanAttendanceMutation,
  useMarkAttendanceMutation,
  useCloseAttendanceSessionMutation,
} = attendanceApi;
