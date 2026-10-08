/** Shared by the inline <head> script (server) and useSidebar (client). No React imports here. */
export const SIDEBAR_STORAGE_KEY = 'ck.sidebar';
export const SIDEBAR_EVENT = 'ck:sidebar';

/** Applies the saved collapse state to <html data-sidebar> before first paint (no layout shift). */
export const sidebarInitScript = `try{if(localStorage.getItem('${SIDEBAR_STORAGE_KEY}')==='collapsed')document.documentElement.dataset.sidebar='collapsed'}catch(e){}`;
