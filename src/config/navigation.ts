import {
  BookOpenCheck,
  Boxes,
  Building2,
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  FileQuestion,
  FileText,
  Home,
  History,
  LayoutDashboard,
  MessageSquareText,
  MonitorPlay,
  Receipt,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { PermissionCode } from '@/features/auth/permissions';
import { ar } from '@/i18n/ar';
import { routes } from './routes';

export interface NavChild {
  label: string;
  href: string;
  permissions?: readonly PermissionCode[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Sub-pages shown in the item's dropdown (add forms, related pages). */
  children?: readonly NavChild[];
  /** Any of these grants visibility; omit for always visible. */
  permissions?: readonly PermissionCode[];
  /** Extra path prefixes that belong to this item (active state + breadcrumb). */
  matches?: readonly string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const t = ar.nav;

/** Guardian / student sidebar (portal accounts have no staff permissions). */
export const portalNavigation: NavGroup[] = [
  {
    label: ar.portal.title,
    items: [
      { label: ar.portal.nav.home, href: routes.portal.home, icon: Home },
      { label: ar.portal.nav.exams, href: routes.portal.exams, icon: FileQuestion },
      { label: ar.portal.nav.assignments, href: routes.portal.assignments, icon: FileText },
      { label: ar.chat.title, href: routes.portal.chat, icon: MessageSquareText },
    ],
  },
];

/** Staff sidebar — the 19 modules of the brief (portal & exam-taking are student-side). */
export const navigation: NavGroup[] = [
  {
    label: t.groups.main,
    items: [{ label: t.dashboard, href: routes.dashboard, icon: LayoutDashboard }],
  },
  {
    label: t.groups.academic,
    items: [
      {
        label: t.students,
        href: routes.students.list,
        icon: Users,
        permissions: ['students.view'],
        matches: [routes.guardians.list],
        children: [
          { label: ar.students.title, href: routes.students.list },
          { label: ar.students.add, href: routes.students.new, permissions: ['students.create'] },
          {
            label: ar.studentImport.link,
            href: routes.students.import,
            permissions: ['students.import'],
          },
          { label: ar.guardians.link, href: routes.guardians.list },
        ],
      },
      {
        label: t.groupsSchedule,
        href: routes.groups.list,
        matches: [routes.sessions.list, routes.halls.list],
        icon: CalendarDays,
        permissions: ['groups.view'],
        children: [
          { label: ar.groups.title, href: routes.groups.list },
          { label: ar.groups.add, href: routes.groups.new, permissions: ['groups.create'] },
          { label: ar.sessions.scheduleLink, href: routes.sessions.list },
          { label: ar.halls.title, href: routes.halls.list },
        ],
      },
      {
        label: t.attendance,
        href: routes.attendance.list,
        icon: ClipboardCheck,
        permissions: ['attendance.view'],
        children: [
          { label: ar.nav.attendance, href: routes.attendance.list },
          { label: ar.excuses.link, href: routes.attendance.excuses },
        ],
      },
      {
        label: t.quizzes,
        href: routes.quizzes.list,
        icon: BookOpenCheck,
        permissions: ['quizzes.view'],
        children: [
          { label: t.quizzes, href: routes.quizzes.list },
          { label: t.sub.newQuiz, href: routes.quizzes.new, permissions: ['quizzes.create'] },
        ],
      },
      {
        label: t.questions,
        href: routes.questions.list,
        icon: FileQuestion,
        permissions: ['questions.view', 'onlineExams.manage'],
        matches: [routes.onlineExams.list],
        children: [
          {
            label: ar.questions.title,
            href: routes.questions.list,
            permissions: ['questions.view'],
          },
          {
            label: ar.questions.add,
            href: routes.questions.new,
            permissions: ['questions.create'],
          },
          {
            label: ar.onlineExams.title,
            href: routes.onlineExams.list,
            permissions: ['onlineExams.manage'],
          },
          {
            label: ar.onlineExams.add,
            href: routes.onlineExams.new,
            permissions: ['onlineExams.manage'],
          },
        ],
      },
    ],
  },
  {
    label: t.groups.finance,
    items: [
      {
        label: t.payments,
        href: routes.payments.list,
        icon: Receipt,
        permissions: ['payments.view'],
        children: [
          { label: ar.payments.title, href: routes.payments.list },
          {
            label: ar.payments.collect,
            href: routes.payments.new,
            permissions: ['payments.create'],
          },
          { label: ar.payments.dues, href: routes.dues },
          {
            label: ar.charges.link,
            href: routes.charges,
            permissions: ['payments.update', 'payments.create'],
          },
        ],
      },
      {
        label: t.cash,
        href: routes.cashShifts.list,
        icon: Wallet,
        permissions: ['cash.view'],
        matches: [routes.expenses.list],
        children: [
          { label: ar.cash.tabs.drawer, href: routes.cashShifts.list },
          { label: ar.cash.tabs.expenses, href: routes.expenses.list },
          { label: ar.expenses.add, href: routes.expenses.new, permissions: ['cash.create'] },
        ],
      },
      {
        label: t.materials,
        href: routes.materials.list,
        icon: Boxes,
        permissions: ['materials.view'],
        children: [
          { label: ar.materials.caption, href: routes.materials.list },
          {
            label: ar.materials.add,
            href: routes.materials.new,
            permissions: ['materials.create'],
          },
        ],
      },
    ],
  },
  {
    label: t.groups.engagement,
    items: [
      {
        label: t.messages,
        href: routes.messages.list,
        icon: MessageSquareText,
        permissions: ['messages.view'],
        children: [
          { label: ar.messages.tabs.log, href: routes.messages.list },
          { label: ar.messages.tabs.campaigns, href: routes.campaigns.list },
          {
            label: ar.messages.campaigns.add,
            href: routes.campaigns.new,
            permissions: ['messages.create'],
          },
          { label: ar.messages.tabs.templates, href: routes.messageTemplates.list },
          { label: ar.messages.tabs.automation, href: routes.automationRules.list },
          { label: ar.chat.tab, href: routes.chat },
        ],
      },
      {
        label: t.content,
        href: routes.videos.list,
        icon: MonitorPlay,
        permissions: ['content.view'],
        matches: [routes.assignments.list, routes.courses.list],
        children: [
          { label: ar.content.tabs.videos, href: routes.videos.list },
          { label: ar.content.tabs.assignments, href: routes.assignments.list },
          { label: ar.content.tabs.courses, href: routes.courses.list },
        ],
      },
    ],
  },
  {
    label: t.groups.admin,
    items: [
      {
        label: t.staff,
        href: routes.staff.list,
        icon: UserCog,
        permissions: ['staff.view'],
        children: [
          { label: ar.staff.tabs.list, href: routes.staff.list },
          { label: ar.staff.add, href: routes.staff.new, permissions: ['staff.create'] },
          { label: ar.staff.tabs.attendance, href: routes.staffAttendance.list },
          { label: ar.staff.tabs.payroll, href: routes.payrolls.list },
        ],
      },
      {
        label: t.roles,
        href: routes.roles.list,
        icon: ShieldCheck,
        permissions: ['roles.manage'],
        children: [
          { label: ar.roles.caption, href: routes.roles.list },
          { label: ar.roles.add, href: routes.roles.new },
        ],
      },
      {
        label: t.reports,
        href: routes.reports.list,
        icon: ChartColumn,
        permissions: ['reports.view'],
        children: [
          { label: ar.reports.title, href: routes.reports.list },
          {
            label: ar.reports.scheduledLink,
            href: routes.reports.scheduled.list,
            permissions: ['reports.schedule'],
          },
        ],
      },
      { label: t.audit, href: routes.audit.list, icon: History, permissions: ['audit.view'] },
      {
        label: t.centers,
        href: routes.centers.hallBookings.list,
        icon: Building2,
        permissions: ['centers.halls', 'centers.teachers', 'centers.settle'],
        matches: [routes.centers.settlements.list, routes.centers.teachers.list],
        children: [
          { label: ar.settlements.tabs.halls, href: routes.centers.hallBookings.list },
          {
            label: ar.teachers.tab,
            href: routes.centers.teachers.list,
            permissions: ['centers.teachers'],
          },
          {
            label: ar.settlements.tabs.settlements,
            href: routes.centers.settlements.list,
            permissions: ['centers.settle'],
          },
        ],
      },
      {
        label: t.settings,
        href: routes.settings.root,
        icon: Settings,
        permissions: ['settings.view', 'settings.update'],
        children: [
          { label: ar.settings.tabs.general, href: routes.settings.root },
          { label: ar.settings.tabs.branches, href: routes.settings.branches.list },
          { label: ar.settings.tabs.academic, href: routes.settings.gradeLevels.list },
        ],
      },
    ],
  },
];

/** Longest-prefix match so /students/123/edit resolves to "الطلاب". */
export function findNavItem(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const item of navigation.flatMap((group) => group.items)) {
    const matches = [item.href, ...(item.matches ?? [])].some(
      (href) => pathname === href || pathname.startsWith(`${href}/`),
    );
    if (matches && (!best || item.href.length > best.href.length)) best = item;
  }
  return best;
}
