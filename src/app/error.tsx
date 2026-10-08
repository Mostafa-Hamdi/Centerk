'use client';

import { ErrorState } from '@/components/ui/ErrorState';
import { ar } from '@/i18n/ar';

/** Route-segment error boundary (applies to every segment without its own error.tsx). */
export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center p-4">
      <ErrorState title={ar.errorPage.title} description={ar.errorPage.desc} onRetry={reset} />
    </main>
  );
}
