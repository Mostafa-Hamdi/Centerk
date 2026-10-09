import { SectionTabs } from '@/components/layout/SectionTabs';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

const t = ar.content;
const tabs = [
  { href: routes.videos.list, label: t.tabs.videos },
  { href: routes.assignments.list, label: t.tabs.assignments },
  { href: routes.courses.list, label: t.tabs.courses },
] as const;

/** Shared header of the online-content pages. */
export function ContentHeader() {
  return (
    <header className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </div>
      <SectionTabs tabs={tabs} label={t.title} />
    </header>
  );
}
