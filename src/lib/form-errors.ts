import type { FieldErrors, FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from '@/components/feedback/toast';
import { ar } from '@/i18n/ar';
import type { Problem } from './problem-details';

/** Maps server validation errors onto form fields. Returns how many fields were matched. */
export function applyServerErrors<T extends FieldValues>(
  problem: Problem,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): number {
  let applied = 0;
  for (const [path, messages] of Object.entries(problem.fieldErrors)) {
    const field = fields.find((name) => name === path);
    const message = messages[0];
    if (field && message) {
      setError(field, { type: 'server', message }, { shouldFocus: applied === 0 });
      applied += 1;
    }
  }
  return applied;
}

/** `handleSubmit` invalid callback: RHF already focuses the first invalid field; we summarize. */
export function toastInvalidForm(errors: FieldErrors): void {
  toast.error(ar.validation.formErrorsTitle, ar.validation.formErrors(countFieldErrors(errors)));
}

/** Counts leaf field errors, so nested objects (guardian.phone…) count per field. */
function countFieldErrors(errors: object): number {
  return Object.values(errors).reduce<number>((count, value: unknown) => {
    if (!value || typeof value !== 'object') return count;
    return count + ('message' in value && 'type' in value ? 1 : countFieldErrors(value));
  }, 0);
}
