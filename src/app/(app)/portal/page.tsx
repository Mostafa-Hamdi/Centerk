import type { Metadata } from 'next';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.portal.title };

/** Placeholder landing for guardian/student logins until the portal module is built. */
export default function PortalPage() {
  return (
    <section className="rounded-xl border border-line bg-surface p-8 shadow-card">
      <h1 className="font-display text-3xl font-bold text-ink">{ar.portal.title}</h1>
      <p className="mt-3 text-muted">{ar.portal.placeholder}</p>
      <LogoutButton className="mt-6" />
    </section>
  );
}
