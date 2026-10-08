/**
 * Attendance mock: every session gets the same 12-student roster. Demo codes:
 * F-1000…F-1011 · F-1004 scans as late · F-1006 has dues · F-1009 is blocked (override allowed).
 */
const names = [
  'سلمى إبراهيم نصر',
  'يوسف أحمد سالم',
  'مريم خالد عادل',
  'عمر طارق حسن',
  'نور محمد علي',
  'آدم سامح فؤاد',
  'ليلى حسن منصور',
  'كريم عادل رشدي',
  'هنا سامح نصر',
  'مالك أحمد سالم',
  'جنى طارق علي',
  'زياد خالد حسن',
];

const roster = names.map((fullName, index) => ({
  studentId: `st-${index + 1}`,
  fullName,
  code: `F-${1000 + index}`,
  balance: index === 6 ? 350 : 0,
  blocked: index === 9,
}));

interface MockRecord {
  id: string;
  studentId: string;
  studentName: string;
  code: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  checkedInAt: string;
}

const sessions = new Map<string, { records: MockRecord[]; closed: boolean }>();
const state = (sessionId: string) => {
  let entry = sessions.get(sessionId);
  if (!entry) {
    entry = { records: [], closed: false };
    sessions.set(sessionId, entry);
  }
  return entry;
};

const json = (body: unknown, status = 200) => Response.json(body, { status });
const problem = (status: number, code: string, title: string, data?: unknown) =>
  Response.json(
    { title, status, code, data },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );

type Body = Record<string, unknown>;
const text = (value: unknown) => (typeof value === 'string' ? value : '');

function snapshot(sessionId: string) {
  const entry = state(sessionId);
  const recorded = new Set(entry.records.map((record) => record.studentId));
  return {
    sessionId,
    groupName: 'كيمياء ٣ث — مجموعة السبت',
    closed: entry.closed,
    records: entry.records,
    notRecorded: entry.closed ? [] : roster.filter((student) => !recorded.has(student.studentId)),
  };
}

export function attendanceMock(method: string, path: string, body: Body): Response | null {
  const list = /^\/sessions\/([^/]+)\/attendance$/.exec(path);
  if (list && method === 'GET') return json(snapshot(decodeURIComponent(list[1] ?? '')));

  if (path === '/attendance/scan' && method === 'POST') {
    const sessionId = text(body.sessionId);
    const entry = state(sessionId);
    if (entry.closed) return problem(409, 'session-closed', 'الحصة اتقفلت');
    const code = (text(body.code) || text(body.qrToken)).trim().toUpperCase();
    const student = roster.find((item) => item.code === code);
    if (!student) return problem(404, 'not-in-group', 'الطالب مش مسجّل في المجموعة دي');
    const existing = entry.records.find((record) => record.studentId === student.studentId);
    if (existing) return json({ outcome: 'AlreadyRecorded', studentName: student.fullName });
    if (student.blocked && body.override !== true) {
      return problem(409, 'student-blocked', 'الطالب موقوف — محتاج سماح استثنائي', {
        studentName: student.fullName,
      });
    }
    const late = student.code === 'F-1004';
    entry.records.push({
      id: `rec-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.fullName,
      code: student.code,
      status: late ? 'Late' : 'Present',
      checkedInAt: new Date().toISOString(),
    });
    return json({
      outcome: late ? 'Late' : 'Recorded',
      studentName: student.fullName,
      balance: student.balance,
    });
  }

  const manual = /^\/sessions\/([^/]+)\/attendance\/manual$/.exec(path);
  if (manual && method === 'POST') {
    const entry = state(decodeURIComponent(manual[1] ?? ''));
    const student = roster.find((item) => item.studentId === body.studentId);
    if (!student) return problem(404, 'not-in-group', 'الطالب مش مسجّل في المجموعة دي');
    entry.records = entry.records.filter((record) => record.studentId !== student.studentId);
    entry.records.push({
      id: `rec-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.fullName,
      code: student.code,
      status:
        (['Present', 'Late', 'Absent', 'Excused'] as const).find(
          (status) => status === body.status,
        ) ?? 'Present',
      checkedInAt: new Date().toISOString(),
    });
    return new Response(null, { status: 204 });
  }

  const close = /^\/sessions\/([^/]+)\/close$/.exec(path);
  if (close && method === 'POST') {
    const sessionId = decodeURIComponent(close[1] ?? '');
    const entry = state(sessionId);
    const recorded = new Set(entry.records.map((record) => record.studentId));
    for (const student of roster.filter((item) => !recorded.has(item.studentId))) {
      entry.records.push({
        id: `rec-${student.studentId}`,
        studentId: student.studentId,
        studentName: student.fullName,
        code: student.code,
        status: 'Absent',
        checkedInAt: new Date().toISOString(),
      });
    }
    entry.closed = true;
    return json({
      present: entry.records.filter((record) => record.status !== 'Absent').length,
      absent: roster.length - recorded.size,
    });
  }
  return null;
}
