'use client';

import { useAnimate, useReducedMotion } from 'framer-motion';
import { useCallback } from 'react';

/** Horizontal shake for failed submissions. Returns [ref, shake]. */
export function useShake<T extends Element = HTMLDivElement>() {
  const [scope, animate] = useAnimate<T>();
  const reduce = useReducedMotion();
  const shake = useCallback(() => {
    if (reduce) return;
    void animate(scope.current, { x: [0, -12, 10, -8, 6, -3, 0] }, { duration: 0.5 });
  }, [animate, scope, reduce]);
  return [scope, shake] as const;
}
