import { SectionTabs } from '@/components/layout/SectionTabs';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

const tabs = [
  { href: routes.questions.list, label: ar.onlineExams.tabs.bank },
  { href: routes.onlineExams.list, label: ar.onlineExams.tabs.exams },
] as const;

/** Question bank ↔ online exams (one sidebar entry «بنك الأسئلة والامتحانات»). */
export function QuestionsTabs() {
  return <SectionTabs tabs={tabs} label={ar.nav.questions} />;
}
