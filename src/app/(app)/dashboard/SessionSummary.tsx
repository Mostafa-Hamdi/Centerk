'use client';

import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { ar } from '@/i18n/ar';
import { selectMe } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

export function SessionSummary() {
  const me = useAppSelector(selectMe);
  if (!me) return null;
  return (
    <section className="w-full rounded-xl border border-line bg-surface p-8 shadow-card">
      <h1 className="font-display text-3xl font-bold text-ink">
        {ar.dashboard.welcome(me.fullName)}
      </h1>
      <p className="mt-2 text-muted">
        {me.tenant.name} · {me.roles.map((role) => role.name).join('، ')} · {me.tenant.plan}
      </p>
      <p className="mt-4 text-sm text-muted">{ar.dashboard.placeholder}</p>
      <LogoutButton className="mt-6" />
    </section>
  );
}
