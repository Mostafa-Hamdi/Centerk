import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';

interface LogoProps {
  /** `inverse` for use on the blue brand panel. */
  tone?: 'brand' | 'inverse';
  showWordmark?: boolean;
  className?: string;
}

/** Brand mark: a "center" — open ring around a cyan core. */
export function Logo({ tone = 'brand', showWordmark = true, className }: LogoProps) {
  const inverse = tone === 'inverse';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden>
        <rect
          width="40"
          height="40"
          rx="12"
          className={inverse ? 'fill-primary-ink' : 'fill-primary'}
        />
        <path
          d="M27.5 12.5A10.5 10.5 0 1 0 30.5 20"
          fill="none"
          strokeWidth="3.2"
          strokeLinecap="round"
          className={inverse ? 'stroke-primary' : 'stroke-primary-ink'}
        />
        <circle cx="20" cy="20" r="4" className="fill-cyan" />
      </svg>
      {showWordmark ? (
        <span
          className={cn(
            'font-display text-2xl leading-none font-bold',
            inverse ? 'text-primary-ink' : 'text-ink',
          )}
        >
          {ar.app.name}
        </span>
      ) : null}
    </span>
  );
}
