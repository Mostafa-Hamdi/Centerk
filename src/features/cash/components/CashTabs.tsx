import { SectionTabs } from '@/components/layout/SectionTabs';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

const tabs = [
  { href: routes.cashShifts.list, label: ar.cash.tabs.drawer },
  { href: routes.expenses.list, label: ar.cash.tabs.expenses },
] as const;

/** Drawer ↔ expenses switcher (one nav entry «الخزنة والمصروفات» covers both pages). */
export function CashTabs() {
  return <SectionTabs tabs={tabs} label={ar.nav.cash} />;
}
