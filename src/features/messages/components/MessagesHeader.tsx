import type { ReactNode } from 'react';
import { SectionTabs } from '@/components/layout/SectionTabs';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

const t = ar.messages;
const tabs = [
  { href: routes.messages.list, label: t.tabs.log, exact: true },
  { href: routes.campaigns.list, label: t.tabs.campaigns },
  { href: routes.messageTemplates.list, label: t.tabs.templates },
  { href: routes.automationRules.list, label: t.tabs.automation },
] as const;

/** Shared header of the messaging pages: title, section tabs and the page's primary action. */
export function MessagesHeader({ action }: { action?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        {action}
      </div>
      <SectionTabs tabs={tabs} label={t.title} />
    </header>
  );
}
