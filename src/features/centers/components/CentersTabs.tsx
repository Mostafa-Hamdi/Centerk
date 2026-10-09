import { SectionTabs } from '@/components/layout/SectionTabs';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

const tabs = [
  { href: routes.centers.hallBookings.list, label: ar.settlements.tabs.halls },
  { href: routes.centers.settlements.list, label: ar.settlements.tabs.settlements },
] as const;

/** Hall bookings ↔ teacher settlements (one sidebar entry «القاعات وتسوية المدرسين»). */
export function CentersTabs() {
  return <SectionTabs tabs={tabs} label={ar.nav.centers} />;
}
