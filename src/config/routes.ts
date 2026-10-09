/**
 * Central route map — components must never hardcode paths.
 * Every CRUD module follows the same shape (see section 6 of the brief):
 * list → /x, add → /x/new, details → /x/[id], edit → /x/[id]/edit.
 */
type Id = string;

const resource = <const Base extends string>(base: Base) =>
  ({
    list: base,
    new: `${base}/new` as const,
    detail: (id: Id) => `${base}/${encodeURIComponent(id)}`,
    edit: (id: Id) => `${base}/${encodeURIComponent(id)}/edit`,
  }) as const;

export const routes = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  account: { password: '/account/password' },

  students: { ...resource('/students'), import: '/students/import' },
  guardians: resource('/guardians'),
  groups: resource('/groups'),
  sessions: resource('/sessions'),
  halls: resource('/halls'),
  attendance: {
    list: '/attendance',
    scan: (sessionId: Id) => `/attendance/${encodeURIComponent(sessionId)}/scan`,
    session: (sessionId: Id) => `/attendance/${encodeURIComponent(sessionId)}`,
    excuses: '/attendance/excuses',
  },
  quizzes: resource('/quizzes'),
  questions: resource('/question-bank'),
  onlineExams: resource('/online-exams'),
  payments: resource('/payments'),
  charges: '/payments/charges',
  discounts: '/payments/discounts',
  alertStudents: (type: Id) => `/dashboard/alerts/${encodeURIComponent(type)}`,
  dues: '/payments/dues',
  cashShifts: resource('/cash-drawer'),
  expenses: resource('/expenses'),
  materials: resource('/materials'),
  messages: resource('/messages'),
  campaigns: resource('/messages/campaigns'),
  messageTemplates: resource('/messages/templates'),
  automationRules: resource('/messages/automation'),
  chat: '/messages/chat',
  videos: resource('/content/videos'),
  assignments: resource('/content/assignments'),
  courses: resource('/content/courses'),
  staff: resource('/staff'),
  staffAttendance: resource('/staff/attendance'),
  payrolls: resource('/staff/payroll'),
  roles: resource('/roles'),
  audit: { list: '/audit-log', detail: (id: Id) => `/audit-log/${encodeURIComponent(id)}` },
  reports: { list: '/reports', scheduled: resource('/reports/scheduled') },
  settings: {
    root: '/settings',
    branches: resource('/settings/branches'),
    subjects: resource('/settings/subjects'),
    gradeLevels: resource('/settings/grade-levels'),
    academicTerms: resource('/settings/academic-terms'),
    policies: '/settings/policies',
    billing: '/settings/billing',
  },
  centers: {
    hallBookings: resource('/centers/hall-bookings'),
    teachers: resource('/centers/teachers'),
    settlements: resource('/centers/settlements'),
  },
  portal: {
    home: '/portal',
    exams: '/portal/exams',
    assignments: '/portal/assignments',
    chat: '/portal/chat',
    attempt: (attemptId: Id) => `/portal/exams/attempts/${encodeURIComponent(attemptId)}`,
  },
  dev: { components: '/dev/components' },
} as const;

/** Routes reachable without a session (used by middleware, robots and sitemap). */
export const publicRoutes = [routes.login, routes.forgotPassword, routes.resetPassword] as const;
