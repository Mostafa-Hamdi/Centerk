import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** tailwind-merge taught about our custom theme scales (see styles/globals.css). */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ['card', 'lift'],
      ease: ['brand'],
    },
  },
});

/** Compose class names: conditional (clsx) + conflict-resolved (tailwind-merge). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
