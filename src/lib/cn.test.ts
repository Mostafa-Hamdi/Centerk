import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges conflicting utilities, last wins', () => {
    expect(cn('px-2 text-ink', 'px-4')).toBe('text-ink px-4');
  });

  it('knows the custom shadow scale', () => {
    expect(cn('shadow-card', 'shadow-lift')).toBe('shadow-lift');
  });

  it('keeps a token color and a font size side by side', () => {
    expect(cn('text-primary', 'text-sm')).toBe('text-primary text-sm');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});
