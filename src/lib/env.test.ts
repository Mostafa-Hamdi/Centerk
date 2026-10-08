import { describe, expect, it } from 'vitest';
import { withApiVersion } from './env';

describe('withApiVersion', () => {
  it('appends /api/v1 to a bare domain (the reported login 404)', () => {
    expect(withApiVersion('https://teachercenter.runasp.net')).toBe(
      'https://teachercenter.runasp.net/api/v1',
    );
    expect(withApiVersion('https://teachercenter.runasp.net/')).toBe(
      'https://teachercenter.runasp.net/api/v1',
    );
  });

  it('keeps URLs that already have an /api prefix and the mock path', () => {
    expect(withApiVersion('https://teachercenter.runasp.net/api/v1/')).toBe(
      'https://teachercenter.runasp.net/api/v1',
    );
    expect(withApiVersion('http://localhost:3000/api/mock')).toBe('http://localhost:3000/api/mock');
    expect(withApiVersion('/api/mock')).toBe('/api/mock');
  });
});
