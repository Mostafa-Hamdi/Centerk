import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center"
    >
      <p className="font-display text-7xl font-bold text-primary-soft">٤٠٤</p>
      <h1 className="font-display text-2xl font-bold text-ink">{ar.notFound.title}</h1>
      <p className="text-muted">{ar.notFound.desc}</p>
      <Link href={routes.dashboard} className={buttonVariants()}>
        {ar.common.home}
      </Link>
    </main>
  );
}
