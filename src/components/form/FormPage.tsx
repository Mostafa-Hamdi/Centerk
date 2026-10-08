import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode, SubmitEventHandler } from 'react';
import { ar } from '@/i18n/ar';

interface FormPageProps {
  title: string;
  description?: string;
  /** Back link (usually the module list). */
  backHref: string;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  /** <FormSection>s */
  children: ReactNode;
  /** <FormActions> — rendered sticky at the bottom. */
  actions: ReactNode;
}

/** Dedicated add/edit page layout (section 6): header, sections, sticky action bar. */
export function FormPage({
  title,
  description,
  backHref,
  onSubmit,
  children,
  actions,
}: FormPageProps) {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="mx-auto flex max-w-5xl flex-col gap-(--shell-gap) pb-4"
    >
      <header className="flex items-start gap-3">
        <Link
          href={backHref}
          aria-label={ar.common.back}
          className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {description ? <p className="mt-1 text-muted">{description}</p> : null}
        </div>
      </header>
      {children}
      {actions}
    </form>
  );
}
