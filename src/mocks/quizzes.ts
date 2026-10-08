/** Quizzes mock: grades for a 12-student roster; publish flips status. */
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

interface MockQuiz {
  id: string;
  title: string;
  groupId: string;
  groupName: string;
  maxScore: number;
  status: 'Draft' | 'Published';
  createdAt: string;
  grades: { studentId: string; studentName: string; code: string; score: number | null }[];
}

const roster = (seed: number) =>
  names.map((studentName, index) => ({
    studentId: `st-${index + 1}`,
    studentName,
    code: `F-${1000 + index}`,
    score: seed ? Math.round(((index * 7 + seed) % 11) * 10) / 10 : null,
  }));

const quizzes: MockQuiz[] = [
  {
    id: 'qz-1',
    title: 'امتحان الباب الأول',
    groupId: 'grp-1',
    groupName: 'كيمياء ٣ث — مجموعة السبت',
    maxScore: 10,
    status: 'Published',
    createdAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
    grades: roster(3),
  },
  {
    id: 'qz-2',
    title: 'كويز الحصة — الروابط',
    groupId: 'grp-1',
    groupName: 'كيمياء ٣ث — مجموعة السبت',
    maxScore: 10,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    grades: roster(0),
  },
];

const json = (body: unknown, status = 200) => Response.json(body, { status });
type Body = Record<string, unknown>;
const average = (quiz: MockQuiz) => {
  const scored = quiz.grades.filter((grade) => grade.score !== null);
  return scored.length
    ? scored.reduce((sum, grade) => sum + (grade.score ?? 0), 0) / scored.length
    : null;
};

export function quizzesMock(
  method: string,
  path: string,
  body: Body | unknown[],
  url: URL,
): Response | null {
  if (path === '/quizzes' && method === 'GET') {
    const groupId = url.searchParams.get('groupId');
    return json(
      quizzes
        .filter((quiz) => !groupId || quiz.groupId === groupId)
        .map(({ grades: _grades, ...quiz }) => ({
          ...quiz,
          average: average({ ...quiz, grades: _grades }),
        })),
    );
  }
  if (path === '/quizzes' && method === 'POST' && !Array.isArray(body)) {
    const created: MockQuiz = {
      id: `qz-${Date.now()}`,
      title: typeof body.title === 'string' ? body.title : 'كويز',
      groupId: typeof body.groupId === 'string' ? body.groupId : 'grp-1',
      groupName: 'كيمياء ٣ث — مجموعة السبت',
      maxScore: typeof body.maxScore === 'number' ? body.maxScore : 10,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      grades: roster(0),
    };
    quizzes.unshift(created);
    return json(created, 201);
  }
  const match = /^\/quizzes\/([^/]+)(?:\/(grades|publish))?$/.exec(path);
  if (!match) return null;
  const quiz = quizzes.find((item) => item.id === decodeURIComponent(match[1] ?? ''));
  if (!quiz) return json({ title: 'الامتحان ده مش موجود', status: 404, code: 'not-found' }, 404);
  if (match[2] === 'grades' && method === 'PUT' && Array.isArray(body)) {
    for (const input of body as { studentId?: string; score?: number | null }[]) {
      const row = quiz.grades.find((grade) => grade.studentId === input.studentId);
      if (row) row.score = typeof input.score === 'number' ? input.score : null;
    }
    return new Response(null, { status: 204 });
  }
  if (match[2] === 'publish' && method === 'POST') {
    quiz.status = 'Published';
    return new Response(null, { status: 204 });
  }
  if (!match[2] && method === 'GET') return json({ ...quiz, average: average(quiz) });
  return null;
}
