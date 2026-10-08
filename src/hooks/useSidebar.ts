import { useCallback, useSyncExternalStore } from 'react';

import { SIDEBAR_EVENT as EVENT, SIDEBAR_STORAGE_KEY as STORAGE_KEY } from '@/config/sidebar';

const subscribe = (callback: () => void) => {
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener(EVENT, callback);
  };
};
const getSnapshot = () => document.documentElement.dataset.sidebar === 'collapsed';
const getServerSnapshot = () => false;

/** Desktop sidebar collapse state, persisted in localStorage and mirrored on <html data-sidebar>. */
export function useSidebar() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCollapsed = useCallback((value: boolean) => {
    if (value) document.documentElement.dataset.sidebar = 'collapsed';
    else delete document.documentElement.dataset.sidebar;
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'collapsed' : 'open');
    } catch {
      // Private mode / blocked storage: the toggle still works for this visit.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { collapsed, setCollapsed, toggle: () => setCollapsed(!getSnapshot()) };
}
