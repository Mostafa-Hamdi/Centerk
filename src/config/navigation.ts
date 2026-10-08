import {
  BookOpenCheck,
  Boxes,
  Building2,
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  FileQuestion,
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

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Any of these grants visibility; omit for always visible. */
  permissions?: readonly PermissionCode[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const t = ar.nav;

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
      },
      {
        label: t.groupsSchedule,
        href: routes.groups.list,
        icon: CalendarDays,
        permissions: ['groups.view'],
      },
      {
        label: t.attendance,
        href: routes.attendance.list,
        icon: ClipboardCheck,
        permissions: ['attendance.view'],
      },
      {
        label: t.quizzes,
        href: routes.quizzes.list,
        icon: BookOpenCheck,
        permissions: ['quizzes.view'],
      },
      {
        label: t.questions,
        href: routes.questions.list,
        icon: FileQuestion,
        permissions: ['questions.view', 'onlineExams.manage'],
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
      },
      { label: t.cash, href: routes.cashShifts.list, icon: Wallet, permissions: ['cash.view'] },
      {
        label: t.materials,
        href: routes.materials.list,
        icon: Boxes,
        permissions: ['materials.view'],
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
      },
      {
        label: t.content,
        href: routes.videos.list,
        icon: MonitorPlay,
        permissions: ['content.view'],
      },
    ],
  },
  {
    label: t.groups.admin,
    items: [
      { label: t.staff, href: routes.staff.list, icon: UserCog, permissions: ['staff.view'] },
      { label: t.roles, href: routes.roles.list, icon: ShieldCheck, permissions: ['roles.manage'] },
      {
        label: t.reports,
        href: routes.reports.list,
        icon: ChartColumn,
        permissions: ['reports.view'],
      },
      { label: t.audit, href: routes.audit.list, icon: History, permissions: ['audit.view'] },
      {
        label: t.centers,
        href: routes.centers.hallBookings.list,
        icon: Building2,
        permissions: ['centers.halls', 'centers.teachers', 'centers.settle'],
      },
      {
        label: t.settings,
        href: routes.settings.root,
        icon: Settings,
        permissions: ['settings.view', 'settings.update'],
      },
    ],
  },
];

/** Longest-prefix match so /students/123/edit resolves to "الطلاب". */
export function findNavItem(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const item of navigation.flatMap((group) => group.items)) {
    const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (!best || item.href.length > best.href.length)) best = item;
  }
  return best;
}
