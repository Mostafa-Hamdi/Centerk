'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ar } from '@/i18n/ar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { mobileNavToggled, selectMobileNavOpen } from '@/store/uiSlice';
import { SidebarNav } from './SidebarNav';

/** Off-canvas navigation for <1024px: slides in from the start (right in RTL), focus-trapped. */
export function MobileDrawer() {
  const open = useAppSelector(selectMobileNavOpen);
  const dispatch = useAppDispatch();
  const close = () => dispatch(mobileNavToggled(false));

  return (
    <Dialog.Root open={open} onOpenChange={(value) => dispatch(mobileNavToggled(value))}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <m.div
                className="fixed inset-y-(--shell-gap) start-(--shell-gap) z-50 flex w-[min(20rem,calc(100vw-2*var(--shell-gap)))] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-lift lg:hidden"
                initial={{ x: '110%' }}
                animate={{ x: 0 }}
                exit={{ x: '110%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              >
                <div className="flex h-(--header-h) shrink-0 items-center justify-between border-b border-line px-4">
                  <Dialog.Title asChild>
                    <span>
                      <Logo />
                    </span>
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label={ar.shell.closeMenu}
                    className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-primary-tint hover:text-ink"
                  >
                    <X className="size-5" aria-hidden />
                  </Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                  <SidebarNav onNavigate={close} />
                </div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
