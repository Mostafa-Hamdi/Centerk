import type { MeDto } from '@/features/auth/types';
import { mockAccounts, mockMe } from './fixtures';
import { attendanceMock } from './attendance';
import { groupsMock, sessionsMock } from './groups';
import { studentsMock } from './students';

/**
 * Minimal in-process mock of the backend (backend-spec §10) for local review without the .NET API.
 * Served at /api/mock/* when API_MOCK=true; point NEXT_PUBLIC_API_URL there.
 */
type Kind = MeDto['kind'];

const LATENCY_MS = 450;
const ACCESS_TTL_MS = 15 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const problem = (status: number, code: string, title: string) =>
  Response.json(
    { type: `https://docs.centerak.app/errors/${code}`, title, status, code, traceId: 'mock' },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );

/** Swagger `AuthTokens`. */
const tokens = (kind: Kind) => ({
  accessToken: `mock-at.${kind}.${crypto.randomUUID()}`,
  refreshToken: `mock-rt.${kind}.${crypto.randomUUID()}`,
  expiresInSeconds: ACCESS_TTL_MS / 1000,
  refreshExpiresAtUtc: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
});

const wrongTenant = (body: Body) => body.tenantSlug !== mockAccounts.tenantSlug;
const tenantProblem = () => problem(404, 'tenant-not-found', 'كود السنتر غير موجود');

const kindFromToken = (token: string | undefined, prefix: string): Kind | null => {
  const kind = token?.startsWith(prefix) ? token.split('.')[1] : undefined;
  return kind === 'Staff' || kind === 'Guardian' || kind === 'Student' ? kind : null;
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const notifications = [
  {
    id: 'n-1',
    title: 'دفعة جديدة',
    body: 'سلمى إبراهيم دفعت ٣٥٠ ج.م · إيصال 2026-10-0482',
    type: 'Payment',
    isRead: false,
    createdAt: minutesAgo(4),
    link: null,
  },
  {
    id: 'n-2',
    title: 'غياب متكرر',
    body: '٣ طلاب غابوا آخر حصتين في كيمياء تالتة ثانوي',
    type: 'Alert',
    isRead: false,
    createdAt: minutesAgo(38),
    link: null,
  },
  {
    id: 'n-3',
    title: 'الحصة اتقفلت',
    body: 'فيزياء تانية ثانوي · حضور ٤٢ من ٥٠',
    type: 'Attendance',
    isRead: false,
    createdAt: minutesAgo(95),
    link: null,
  },
  {
    id: 'n-4',
    title: 'تقرير الشهر جاهز',
    body: 'تقرير التحصيل لشهر سبتمبر اتبعت على واتساب',
    type: 'System',
    isRead: true,
    createdAt: minutesAgo(60 * 26),
    link: null,
  },
];

const todaySessions = [
  ['كيمياء · تالتة ثانوي (أ)', 'كيمياء', 'أ. هبة رشدي', 'قاعة ١', '09:00', '10:30', 'Done', 48, 45],
  ['فيزياء · تانية ثانوي', 'فيزياء', 'أ. محمد فوزي', 'قاعة ٢', '11:00', '12:30', 'Done', 40, 33],
  ['أحياء · تالتة ثانوي', 'أحياء', 'أ. سارة نبيل', 'قاعة ٣', '13:00', '14:30', 'Live', 50, 42],
  ['كيمياء · تالتة ثانوي (ب)', 'كيمياء', 'أ. هبة رشدي', 'قاعة ١', '15:00', '16:30', 'Live', 45, 29],
  [
    'رياضيات · أولى ثانوي',
    'رياضيات',
    'أ. كريم عادل',
    'قاعة ٢',
    '17:00',
    '18:30',
    'Upcoming',
    38,
    0,
  ],
  ['لغة عربية · تالتة ثانوي', 'عربي', 'أ. منى سمير', 'قاعة ٣', '19:00', '20:30', 'Upcoming', 52, 0],
].map(
  (
    [groupName, subject, teacherName, hallName, startTime, endTime, status, expected, present],
    index,
  ) => ({
    id: `sess-${index + 1}`,
    groupName,
    subject,
    teacherName,
    hallName,
    startTime,
    endTime,
    status,
    expected,
    present,
  }),
);

type Body = Record<string, unknown>;
type Handler = (body: Body, request: Request) => Response;

const routes: Record<string, Handler> = {
  'POST /auth/login': (body) =>
    wrongTenant(body)
      ? tenantProblem()
      : body.phone === mockAccounts.staff.phone && body.password === mockAccounts.staff.password
        ? json(tokens('Staff'))
        : problem(401, 'invalid-credentials', 'رقم الموبايل أو كلمة السر غلط'),

  'POST /auth/otp/request': (body) => {
    if (wrongTenant(body)) return tenantProblem();
    if (body.purpose === 'guardian-login' && body.phone !== mockAccounts.guardian.phone) {
      return problem(404, 'not-found', 'الرقم ده مش مسجّل كولي أمر');
    }
    if (body.purpose === 'student-login' && body.studentCode !== mockAccounts.student.studentCode) {
      return problem(404, 'not-found', 'كود الطالب مش موجود');
    }
    return json({
      challengeId: crypto.randomUUID(),
      resendAfterSeconds: 60,
      maskedDestination: `${String(body.phone).slice(0, 4)}****${String(body.phone).slice(-3)}`,
    });
  },

  'POST /auth/otp/verify': (body) => {
    if (body.code !== mockAccounts.otp)
      return problem(400, 'invalid-otp', 'الكود غلط أو انتهت صلاحيته');
    return json(tokens(body.purpose === 'student-login' ? 'Student' : 'Guardian'));
  },

  'POST /auth/refresh': (body) => {
    const kind = kindFromToken(
      typeof body.refreshToken === 'string' ? body.refreshToken : undefined,
      'mock-rt.',
    );
    return kind ? json(tokens(kind)) : problem(401, 'session-expired', 'انتهت الجلسة');
  },

  'POST /auth/logout': () => new Response(null, { status: 204 }),
  'POST /auth/password/forgot': () => new Response(null, { status: 204 }),
  'POST /auth/password/reset': (body) =>
    body.token === 'expired'
      ? problem(400, 'invalid-token', 'الرابط انتهت صلاحيته، اطلب رابط جديد')
      : new Response(null, { status: 204 }),

  'GET /notifications': () =>
    json({
      items: notifications,
      unreadCount: notifications.filter((item) => !item.isRead).length,
    }),
  'POST /notifications/read-all': () => {
    notifications.forEach((item) => {
      item.isRead = true;
    });
    return new Response(null, { status: 204 });
  },

  'GET /dashboard/summary': () =>
    json({
      incomeToday: 12450,
      incomeYesterday: 11100,
      sessionsToday: { total: 9, live: 2, upcoming: 4, done: 3, cancelled: 0 },
      monthlyAttendanceRate: 0.874,
      openDues: { total: 31800, count: 42 },
      activeStudents: 486,
    }),
  'GET /dashboard/today-sessions': () => json(todaySessions),
  'GET /dashboard/alerts': () =>
    json([
      { type: 'consecutive-absences', count: 7 },
      { type: 'weak-last-quiz', count: 12 },
      { type: 'overdue-30', count: 5 },
      { type: 'waitlist', count: 3 },
    ]),
  'GET /dashboard/income-7d': () =>
    json(
      [8200, 9650, 7400, 11800, 10250, 11100, 12450].map((amount, index) => ({
        date: new Date(Date.now() - (6 - index) * 86_400_000).toISOString().slice(0, 10),
        amount,
      })),
    ),

  'GET /me': (_body, request) => {
    const kind = kindFromToken(
      request.headers.get('authorization')?.replace('Bearer ', ''),
      'mock-at.',
    );
    return kind ? json(mockMe[kind]) : problem(401, 'unauthorized', 'غير مصرح');
  },
};

export async function handleMockRequest(method: string, path: string, request: Request) {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  const body =
    method === 'GET' || method === 'DELETE'
      ? {}
      : ((await request.json().catch(() => ({}))) as Body);
  const handler = routes[`${method} ${path}`];
  if (handler) return handler(body, request);
  const moduleResponse =
    studentsMock(method, path, body, new URL(request.url)) ??
    groupsMock(method, path, body, new URL(request.url)) ??
    sessionsMock(method, path, body, new URL(request.url)) ??
    attendanceMock(method, path, body);
  return moduleResponse ?? problem(404, 'mock-not-found', `لا يوجد mock لـ ${method} ${path}`);
}
