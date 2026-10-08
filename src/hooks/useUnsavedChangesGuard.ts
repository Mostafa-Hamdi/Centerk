import { useEffect } from 'react';
import { ar } from '@/i18n/ar';

/**
 * Warns before leaving a dirty form: browser reload/close (beforeunload) and in-app <a> link
 * clicks (App Router has no navigation events, so we intercept clicks in the capture phase).
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest('a[href]');
      if (!anchor || anchor.getAttribute('target') === '_blank') return;
      const href = anchor.getAttribute('href') ?? '';
      if (href.startsWith('#')) return;
      if (!window.confirm(ar.common.unsavedChanges)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);
}
