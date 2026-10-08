'use client';

import { setupListeners } from '@reduxjs/toolkit/query';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/feedback/Toaster';
import { makeStore } from '@/store/store';

const loadMotionFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

/**
 * App-wide client providers.
 * - Redux store created once per browser session (never shared across server requests).
 * - LazyMotion (strict): components must use `m.*`; animation features load after hydration.
 * - MotionConfig reducedMotion="user": honours prefers-reduced-motion everywhere.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => setupListeners(store.dispatch), [store]);

  return (
    <Provider store={store}>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster />
        </MotionConfig>
      </LazyMotion>
    </Provider>
  );
}
