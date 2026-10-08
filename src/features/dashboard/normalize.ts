import type { DashboardSummaryDto, SessionStatus, TodaySessionDto } from './api';

/**
 * The live /dashboard/* endpoints have no response schema in Swagger, so responses are normalized
 * defensively: known field names (and a few likely aliases) are read, anything missing becomes
 * `null` and renders as "—" instead of crashing. Update the alias lists once the backend
 * publishes its DTOs (docs/backend-requests.md §3).
 */
type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Reads the first path ("openDues.total") that holds a value. */
function read(source: unknown, paths: readonly string[]): unknown {
  for (const path of paths) {
    let current: unknown = source;
    for (const key of path.split('.')) current = isObject(current) ? current[key] : undefined;
    if (current !== undefined && current !== null) return current;
  }
  return undefined;
}

function num(source: unknown, ...paths: string[]): number | null {
  const value = read(source, paths);
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

function str(source: unknown, ...paths: string[]): string | null {
  const value = read(source, paths);
  return typeof value === 'string' && value ? value : null;
}

const warned = new Set<string>();
function warnShape(endpoint: string, raw: unknown) {
  if (process.env.NODE_ENV === 'production' || warned.has(endpoint)) return;
  warned.add(endpoint);
  console.warn(
    `[dashboard] ${endpoint}: unexpected response shape — please share it to map fields`,
    raw,
  );
}

export function normalizeSummary(raw: unknown): DashboardSummaryDto {
  const rate = num(raw, 'monthlyAttendanceRate', 'attendanceRate', 'attendance.monthlyRate');
  const summary: DashboardSummaryDto = {
    incomeToday: num(raw, 'incomeToday', 'todayIncome', 'collectedToday', 'income.today'),
    incomeYesterday: num(raw, 'incomeYesterday', 'yesterdayIncome', 'income.yesterday'),
    sessionsToday: {
      total: num(
        raw,
        'sessionsToday.total',
        'sessionsTodayCount',
        'todaySessions.total',
        'sessionsToday',
      ),
      live: num(raw, 'sessionsToday.live', 'sessionsToday.inProgress', 'liveSessions'),
      upcoming: num(raw, 'sessionsToday.upcoming', 'sessionsToday.scheduled', 'upcomingSessions'),
      done: num(raw, 'sessionsToday.done', 'sessionsToday.completed', 'completedSessions'),
      cancelled: num(raw, 'sessionsToday.cancelled', 'cancelledSessions'),
    },
    // Accept 0–1 ratios and 0–100 percentages.
    monthlyAttendanceRate: rate === null ? null : rate > 1 ? rate / 100 : rate,
    openDues: {
      total: num(raw, 'openDues.total', 'openDuesTotal', 'dues.total', 'openBalance'),
      count: num(raw, 'openDues.count', 'openDuesCount', 'dues.count', 'studentsWithDues'),
    },
    activeStudents: num(raw, 'activeStudents', 'activeStudentsCount', 'students.active'),
  };
  if (summary.incomeToday === null || summary.openDues.total === null) warnShape('summary', raw);
  return summary;
}

const STATUS: Record<string, SessionStatus> = {
  live: 'Live',
  inprogress: 'Live',
  started: 'Live',
  open: 'Live',
  upcoming: 'Upcoming',
  scheduled: 'Upcoming',
  planned: 'Upcoming',
  done: 'Done',
  completed: 'Done',
  closed: 'Done',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
};

/** "2026-10-08T15:00:00" / "15:00:00" → "15:00" */
const toHHmm = (value: string | null) =>
  value ? (/(\d{2}:\d{2})/.exec(value)?.[1] ?? value) : '—';

export function normalizeTodaySessions(raw: unknown): TodaySessionDto[] {
  const list = Array.isArray(raw) ? raw : read(raw, ['items', 'sessions', 'data']);
  if (!Array.isArray(list)) {
    warnShape('today-sessions', raw);
    return [];
  }
  return list.map((item: unknown, index): TodaySessionDto => {
    const status =
      str(item, 'status', 'state')
        ?.replace(/[\s_-]/g, '')
        .toLowerCase() ?? '';
    return {
      id: str(item, 'id', 'sessionId') ?? `session-${index}`,
      groupName: str(item, 'groupName', 'group.name', 'groupTitle', 'title') ?? '—',
      subject: str(item, 'subject', 'subjectName', 'group.subject') ?? '',
      teacherName: str(item, 'teacherName', 'teacher.fullName', 'teacher.name') ?? '',
      hallName: str(item, 'hallName', 'hall.name'),
      startTime: toHHmm(str(item, 'startTime', 'startsAt', 'start')),
      endTime: toHHmm(str(item, 'endTime', 'endsAt', 'end')),
      status: STATUS[status] ?? 'Upcoming',
      expected: num(item, 'expected', 'expectedCount', 'enrolledCount', 'studentsCount') ?? 0,
      present: num(item, 'present', 'presentCount', 'attendedCount') ?? 0,
    };
  });
}
