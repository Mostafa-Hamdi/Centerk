import { SectionTabs } from '@/components/layout/SectionTabs';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

const t = ar.settings;
const tabs = [
  { href: routes.settings.root, label: t.tabs.general, exact: true },
  { href: routes.settings.branches.list, label: t.tabs.branches },
  { href: routes.settings.gradeLevels.list, label: t.tabs.academic },
] as const;

/** Shared header of the settings pages. */
export function SettingsHeader() {
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
