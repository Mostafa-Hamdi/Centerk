import { Hammer } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

/** Placeholder for sidebar modules not built yet — keeps the link from landing on a 404. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl border border-line bg-surface p-10 text-center shadow-card">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Hammer className="size-7" aria-hidden />
      </span>
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="max-w-md text-muted">{ar.comingSoon.description}</p>
      <Link href={routes.dashboard} className={buttonVariants({ variant: 'info' })}>
        {ar.comingSoon.back}
      </Link>
    </section>
  );
}
