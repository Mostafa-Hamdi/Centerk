import { describe, expect, it } from 'vitest';
import { DEFAULT_API_URL, env, withApiVersion } from './env';

describe('withApiVersion', () => {
  it('appends /api/v1 to a bare domain', () => {
    expect(withApiVersion('https://teachercenter.runasp.net')).toBe(DEFAULT_API_URL);
    expect(withApiVersion('https://teachercenter.runasp.net/')).toBe(DEFAULT_API_URL);
  });

  it('keeps URLs that already have an /api prefix', () => {
    expect(withApiVersion(`${DEFAULT_API_URL}/`)).toBe(DEFAULT_API_URL);
  });
});

describe('env', () => {
  it('defaults to the live backend (no mock fallback)', () => {
    expect(env.NEXT_PUBLIC_API_URL).toBe(DEFAULT_API_URL);
  });
});
