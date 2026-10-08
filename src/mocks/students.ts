/** In-memory students for the mock backend (resets on server restart). */

interface MockStudent {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
  grade: string | null;
  status: 'Active' | 'Suspended' | 'Withdrawn' | 'Graduated';
  guardianName: string | null;
  balance: number;
  createdAt: string;
  branchId: string | null;
  guardians: { id: string; fullName: string; phone: string; relation: string }[];
  attendanceRate: number | null;
  averageGrade: number | null;
}

const first = [
  'سلمى',
  'يوسف',
  'مريم',
  'عمر',
  'نور',
  'آدم',
  'ليلى',
  'كريم',
  'هنا',
  'مالك',
  'جنى',
  'زياد',
];
const fathers = ['إبراهيم', 'أحمد', 'خالد', 'طارق', 'محمد', 'سامح', 'عادل', 'حسن'];
const families = ['نصر', 'سالم', 'عادل', 'حسن', 'علي', 'فؤاد', 'رشدي', 'منصور'];
const grades = ['الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'];

const students: MockStudent[] = Array.from({ length: 37 }, (_, index) => {
  const father = fathers[index % fathers.length] ?? '';
  const family = families[(index * 3) % families.length] ?? '';
  return {
    id: `st-${index + 1}`,
    code: `F-${1000 + index}`,
    fullName: `${first[index % first.length] ?? ''} ${father} ${family}`,
    phone: index % 4 === 0 ? null : `0101${String(1000000 + index * 7919).slice(0, 7)}`,
    grade: grades[index % grades.length] ?? null,
    status: index % 9 === 0 ? 'Suspended' : 'Active',
    guardianName: `${father} ${family}`,
    balance: (index * 137) % 700,
    createdAt: new Date(Date.now() - index * 86_400_000 * 3).toISOString(),
    branchId: 'b-1',
    guardians: [
      {
        id: `g-${index + 1}`,
        fullName: `${father} ${family}`,
        phone: `0109${String(2000000 + index * 104729).slice(0, 7)}`,
        relation: 'Father',
      },
    ],
    attendanceRate: 0.7 + ((index * 7) % 30) / 100,
    averageGrade: 55 + ((index * 11) % 45),
  };
});

const normalize = (value: string) =>
  value
    .replace(/[ً-ْ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase();

const json = (body: unknown, status = 200) => Response.json(body, { status });
const problem = (status: number, code: string, title: string, errors?: Record<string, string[]>) =>
  Response.json(
    { title, status, code, errors },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );

type Body = Record<string, unknown>;

/** List rows omit the 360-profile fields. */
const toRow = (student: MockStudent) => ({
  id: student.id,
  code: student.code,
  fullName: student.fullName,
  phone: student.phone,
  grade: student.grade,
  status: student.status,
  guardianName: student.guardianName,
  balance: student.balance,
  createdAt: student.createdAt,
});

/** Handles /students routes; returns null when the path isn't a students route. */
export function studentsMock(method: string, path: string, body: Body, url: URL): Response | null {
  if (path === '/students' && method === 'GET') {
    const search = normalize(url.searchParams.get('search') ?? '');
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Number(url.searchParams.get('pageSize')) || 20);
    const visible = students.filter((student) => student.status !== 'Withdrawn');
    const matches = search
      ? visible.filter((student) =>
          normalize(`${student.fullName} ${student.code} ${student.phone ?? ''}`).includes(search),
        )
      : visible;
    const items = matches.slice((page - 1) * pageSize, page * pageSize).map(toRow);
    return json({
      items,
      page,
      pageSize,
      totalCount: matches.length,
      totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
    });
  }

  if (path === '/students' && method === 'POST') {
    const guardian = body.guardian as
      { fullName: string; phone: string; relation: string } | undefined;
    if (
      guardian &&
      !body.confirmSibling &&
      students.some((student) => student.guardians.some((g) => g.phone === guardian.phone))
    ) {
      return problem(
        409,
        'duplicate-phone',
        'رقم ولي الأمر مسجّل لطالب تاني — لو أخوات أكّد التسجيل',
        { 'guardian.phone': ['الرقم مسجّل قبل كده'] },
      );
    }
    const created: MockStudent = {
      id: `st-${Date.now()}`,
      code: `F-${1000 + students.length}`,
      fullName: String(body.fullName),
      phone: (body.phone as string | undefined) ?? null,
      grade: (body.grade as string | undefined) ?? null,
      status: 'Active',
      guardianName: guardian?.fullName ?? null,
      balance: 0,
      createdAt: new Date().toISOString(),
      branchId: (body.branchId as string | undefined) ?? null,
      guardians: guardian ? [{ id: `g-${Date.now()}`, ...guardian }] : [],
      attendanceRate: null,
      averageGrade: null,
    };
    students.unshift(created);
    return json(created, 201);
  }

  const match = /^\/students\/([^/]+)$/.exec(path);
  if (!match) return null;
  const student = students.find((item) => item.id === decodeURIComponent(match[1] ?? ''));
  if (!student) return problem(404, 'not-found', 'الطالب ده مش موجود');

  if (method === 'GET') return json(student);
  if (method === 'PUT') {
    Object.assign(student, {
      fullName: body.fullName,
      phone: body.phone ?? null,
      grade: body.grade ?? null,
    });
    return json(student);
  }
  if (method === 'DELETE') {
    student.status = 'Withdrawn';
    return new Response(null, { status: 204 });
  }
  return null;
}
