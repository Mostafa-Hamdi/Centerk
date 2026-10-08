import type { MeDto } from '@/features/auth/types';
import { mockAccounts, mockMe } from './fixtures';

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

const tokens = (kind: Kind) => ({
  accessToken: `mock-at.${kind}.${crypto.randomUUID()}`,
  accessTokenExpiresAt: new Date(Date.now() + ACCESS_TTL_MS).toISOString(),
  refreshToken: `mock-rt.${kind}.${crypto.randomUUID()}`,
  refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
});

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

type Body = Record<string, unknown>;
type Handler = (body: Body, request: Request) => Response;

const routes: Record<string, Handler> = {
  'POST /auth/login': (body) =>
    body.phone === mockAccounts.staff.phone && body.password === mockAccounts.staff.password
      ? json(tokens('Staff'))
      : problem(401, 'invalid-credentials', 'رقم الموبايل أو كلمة السر غلط'),

  'POST /auth/otp/request': (body) => {
    if (body.phone && body.phone !== mockAccounts.guardian.phone) {
      return problem(404, 'not-found', 'الرقم ده مش مسجّل كولي أمر');
    }
    if (body.studentCode && body.studentCode !== mockAccounts.student.studentCode) {
      return problem(404, 'not-found', 'كود الطالب مش موجود');
    }
    return json({
      resendAfterSeconds: 60,
      maskedDestination: body.phone ? '0111****111' : 'واتساب ولي الأمر 0109****211',
    });
  },

  'POST /auth/otp/verify': (body) => {
    if (body.code !== mockAccounts.otp)
      return problem(400, 'invalid-otp', 'الكود غلط أو انتهت صلاحيته');
    return json(tokens(body.studentCode ? 'Student' : 'Guardian'));
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
  const handler = routes[`${method} ${path}`];
  if (!handler) return problem(404, 'mock-not-found', `لا يوجد mock لـ ${method} ${path}`);
  const body = method === 'GET' ? {} : ((await request.json().catch(() => ({}))) as Body);
  return handler(body, request);
}
