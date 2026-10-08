import type { ReactNode, Ref } from 'react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';

/** CSS stagger (not Framer) so the card paints before hydration — keeps LCP low. */
const stagger = [
  '[animation-delay:0ms]',
  '[animation-delay:70ms]',
  '[animation-delay:140ms]',
  '[animation-delay:210ms]',
];

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Target for the failed-login shake. */
  ref?: Ref<HTMLDivElement>;
  icon?: ReactNode;
}

/** Floating white card used by every auth screen, with a staggered entrance. */
export function AuthCard({ title, subtitle, children, ref, icon }: AuthCardProps) {
  return (
    <div
      ref={ref}
      className="w-full max-w-[28rem] rounded-xl border border-line bg-surface p-6 shadow-card sm:p-9"
    >
      <div className={cn('mb-6 animate-rise lg:hidden', stagger[0])}>
        <Logo />
      </div>
      <header className={cn('mb-7 animate-rise', stagger[1])}>
        {icon ? <div className="mb-4">{icon}</div> : null}
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
      </header>
      <div className={cn('animate-rise', stagger[2])}>{children}</div>
    </div>
  );
}
