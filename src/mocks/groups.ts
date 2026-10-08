/** In-memory groups + halls for the mock backend (resets on server restart). */

interface MockGroup {
  id: string;
  name: string;
  subject: string;
  grade: string;
  teacherId: string | null;
  teacherName: string | null;
  hallId: string | null;
  hallName: string | null;
  branchId: string;
  capacity: number | null;
  enrolledCount: number;
  price: number;
  status: 'Active' | 'Paused' | 'Closed';
  schedule: {
    dayOfWeek: number;
    startTime: string;
    durationMinutes: number;
    hallId: string | null;
  }[];
}

const halls = [
  { id: 'h-1', name: 'قاعة ١', capacity: 50 },
  { id: 'h-2', name: 'قاعة ٢', capacity: 40 },
  { id: 'h-3', name: 'قاعة ٣ (الكبيرة)', capacity: 80 },
];

const seed: [string, string, string, string, number, number, number][] = [
  ['كيمياء ٣ث — مجموعة السبت', 'كيمياء', 'الثالث الثانوي', 'أ. هبة رشدي', 0, 48, 350],
  ['فيزياء ٢ث — مجموعة الأحد', 'فيزياء', 'الثاني الثانوي', 'أ. محمد فوزي', 1, 33, 300],
  ['أحياء ٣ث', 'أحياء', 'الثالث الثانوي', 'أ. سارة نبيل', 2, 42, 350],
  ['رياضيات ١ث', 'رياضيات', 'الأول الثانوي', 'أ. كريم عادل', 1, 38, 250],
  ['لغة عربية ٣ث', 'لغة عربية', 'الثالث الثانوي', 'أ. منى سمير', 2, 52, 300],
  ['كيمياء ٣ث — مجموعة الثلاثاء', 'كيمياء', 'الثالث الثانوي', 'أ. هبة رشدي', 0, 45, 350],
];

const groups: MockGroup[] = seed.map(
  ([name, subject, grade, teacherName, hall, enrolled, price], index) => ({
    id: `grp-${index + 1}`,
    name,
    subject,
    grade,
    teacherId: `t-${index + 1}`,
    teacherName,
    hallId: halls[hall]?.id ?? null,
    hallName: halls[hall]?.name ?? null,
    branchId: 'b-1',
    capacity: halls[hall]?.capacity ?? null,
    enrolledCount: enrolled,
    price,
    status: index === 3 ? 'Paused' : 'Active',
    schedule: [
      {
        dayOfWeek: index % 7,
        startTime: `${String(13 + (index % 5)).padStart(2, '0')}:00`,
        durationMinutes: 90,
        hallId: halls[hall]?.id ?? null,
      },
      {
        dayOfWeek: (index + 3) % 7,
        startTime: `${String(15 + (index % 4)).padStart(2, '0')}:30`,
        durationMinutes: 90,
        hallId: halls[hall]?.id ?? null,
      },
    ],
  }),
);

const json = (body: unknown, status = 200) => Response.json(body, { status });
const notFound = () =>
  Response.json(
    { title: 'المجموعة دي مش موجودة', status: 404, code: 'not-found' },
    { status: 404 },
  );

type Body = Record<string, unknown>;

const text = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

/** List rows omit details-only fields. */
const toRow = (group: MockGroup) => ({
  id: group.id,
  name: group.name,
  subject: group.subject,
  grade: group.grade,
  teacherName: group.teacherName,
  hallName: group.hallName,
  capacity: group.capacity,
  enrolledCount: group.enrolledCount,
  price: group.price,
  status: group.status,
});

/** Handles /groups and /halls routes; returns null for other paths. */
export function groupsMock(method: string, path: string, body: Body, url: URL): Response | null {
  if (path === '/halls' && method === 'GET') return json(halls);

  if (path === '/groups' && method === 'GET') {
    const search = (url.searchParams.get('search') ?? '').trim();
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Number(url.searchParams.get('pageSize')) || 20);
    const matches = search
      ? groups.filter((group) =>
          `${group.name} ${group.subject} ${group.teacherName ?? ''}`.includes(search),
        )
      : groups;
    return json({
      items: matches.slice((page - 1) * pageSize, page * pageSize).map(toRow),
      page,
      pageSize,
      totalCount: matches.length,
      totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
    });
  }

  if (path === '/groups' && method === 'POST') {
    const hall = halls.find((item) => item.id === body.hallId);
    const created: MockGroup = {
      id: `grp-${Date.now()}`,
      name: text(body.name),
      subject: text(body.subject),
      grade: text(body.grade),
      teacherId: (body.teacherId as string | undefined) ?? null,
      teacherName: null,
      hallId: hall?.id ?? null,
      hallName: hall?.name ?? null,
      branchId: text(body.branchId, 'b-1'),
      capacity: (body.capacity as number | undefined) ?? hall?.capacity ?? null,
      enrolledCount: 0,
      price: Number(body.price ?? 0),
      status: 'Active',
      schedule: [],
    };
    groups.unshift(created);
    return json(created, 201);
  }

  const match = /^\/groups\/([^/]+)(?:\/(pause|resume|schedule))?$/.exec(path);
  if (!match) return null;
  const group = groups.find((item) => item.id === decodeURIComponent(match[1] ?? ''));
  if (!group) return notFound();
  const action = match[2];

  if (action === 'pause' || action === 'resume') {
    group.status = action === 'pause' ? 'Paused' : 'Active';
    return new Response(null, { status: 204 });
  }
  if (action === 'schedule') return json(group.schedule);
  if (method === 'GET') return json(group);
  if (method === 'PUT') {
    const hall = halls.find((item) => item.id === body.hallId);
    Object.assign(group, {
      name: body.name ?? group.name,
      capacity: body.capacity ?? group.capacity,
      price: body.monthlyPrice ?? group.price,
      hallId: hall?.id ?? group.hallId,
      hallName: hall?.name ?? group.hallName,
    });
    return json(group);
  }
  return null;
}

/** Sessions generated from the groups' weekly slots (Cairo time ≈ UTC+3), with cancel/postpone state. */
const sessionChanges = new Map<
  string,
  { status: 'Cancelled' | 'Postponed'; startsAtUtc?: string }
>();

export function sessionsMock(method: string, path: string, body: Body, url: URL): Response | null {
  if (path === '/sessions' && method === 'GET') {
    const from = new Date(
      `${url.searchParams.get('from') ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`,
    );
    const to = new Date(
      `${url.searchParams.get('to') ?? from.toISOString().slice(0, 10)}T00:00:00Z`,
    );
    const groupId = url.searchParams.get('groupId');
    const sessions = [];
    for (let day = new Date(from); day <= to; day.setUTCDate(day.getUTCDate() + 1)) {
      const date = day.toISOString().slice(0, 10);
      for (const group of groups) {
        if (group.status !== 'Active' || (groupId && group.id !== groupId)) continue;
        for (const slot of group.schedule) {
          if (slot.dayOfWeek !== day.getUTCDay()) continue;
          const id = `${group.id}_${date}_${slot.startTime}`;
          const change = sessionChanges.get(id);
          sessions.push({
            id,
            groupId: group.id,
            groupName: group.name,
            hallName: group.hallName,
            startsAtUtc:
              change?.startsAtUtc ?? new Date(`${date}T${slot.startTime}:00+03:00`).toISOString(),
            durationMinutes: slot.durationMinutes,
            kind: 'Regular',
            status: change?.status ?? 'Scheduled',
            topic: null,
          });
        }
      }
    }
    return json(sessions);
  }
  const match = /^\/sessions\/([^/]+)\/(cancel|postpone)$/.exec(path);
  if (!match || method !== 'POST') return null;
  const id = decodeURIComponent(match[1] ?? '');
  if (match[2] === 'cancel') sessionChanges.set(id, { status: 'Cancelled' });
  else
    sessionChanges.set(id, {
      status: 'Postponed',
      startsAtUtc: text(body.startsAtUtc) || undefined,
    });
  return new Response(null, { status: 204 });
}
