import { House } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/feedback/BackButton';
import { buttonVariants } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';

const SPARKS = [
  { top: '12%', start: '18%', delay: '0s' },
  { top: '22%', start: '78%', delay: '1.2s' },
  { top: '68%', start: '10%', delay: '2.1s' },
  { top: '80%', start: '70%', delay: '0.6s' },
  { top: '42%', start: '90%', delay: '1.7s' },
  { top: '55%', start: '30%', delay: '2.6s' },
] as const;

/** 404 — floating gradient digits, an orbiting ring around the zero, drifting light blobs. */
export default function NotFound() {
  return (
    <main
      id="main"
      className="nf-stage relative isolate flex min-h-dvh items-center justify-center overflow-hidden p-4"
    >
      <div aria-hidden className="nf-grid absolute inset-0 -z-10" />
      <div aria-hidden className="nf-blob nf-blob-a" />
      <div aria-hidden className="nf-blob nf-blob-b" />
      <div aria-hidden className="nf-blob nf-blob-c" />
      {SPARKS.map((spark) => (
        <span
          key={`${spark.top}-${spark.start}`}
          aria-hidden
          className="nf-spark"
          style={{ top: spark.top, insetInlineStart: spark.start, animationDelay: spark.delay }}
        />
      ))}

      <section className="flex flex-col items-center text-center">
        <p className="nf-eyebrow">{ar.notFound.eyebrow}</p>
        <p aria-hidden className="nf-digits">
          <span className="nf-digit" style={{ animationDelay: '0s' }}>
            ٤
          </span>
          <span className="nf-digit nf-zero" style={{ animationDelay: '0.35s' }}>
            ٠
            <span className="nf-orbit">
              <span className="nf-planet" />
            </span>
          </span>
          <span className="nf-digit" style={{ animationDelay: '0.7s' }}>
            ٤
          </span>
        </p>

        <div className="nf-card mt-2 flex max-w-md flex-col items-center gap-3 px-8 py-7">
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            {ar.notFound.title}
          </h1>
          <p className="text-muted">{ar.notFound.desc}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Link href={routes.dashboard} className={buttonVariants({ size: 'lg' })}>
              <House className="size-4" aria-hidden />
              {ar.common.home}
            </Link>
            <BackButton label={ar.notFound.back} />
          </div>
        </div>
      </section>
    </main>
  );
}
