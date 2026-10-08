'use client';

import { Save } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants, Button } from '@/components/ui/Button';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { ar } from '@/i18n/ar';

interface FormActionsProps {
  cancelHref: string;
  submitting: boolean;
  /** Enables the "unsaved changes" guard. Pass formState.isDirty && !isSubmitSuccessful. */
  dirty: boolean;
  submitLabel?: string;
}

/** Sticky glass bar with cancel + save; guards navigation while the form is dirty. */
export function FormActions({
  cancelHref,
  submitting,
  dirty,
  submitLabel = ar.common.save,
}: FormActionsProps) {
  useUnsavedChangesGuard(dirty && !submitting);
  return (
    <div className="sticky bottom-(--shell-gap) z-20 flex items-center justify-end gap-3 rounded-lg border border-line glass p-3 shadow-lift">
      <Link href={cancelHref} className={buttonVariants({ variant: 'neutral' })}>
        {ar.common.cancel}
      </Link>
      <Button type="submit" loading={submitting} iconStart={<Save aria-hidden />}>
        {submitLabel}
      </Button>
    </div>
  );
}
