import { describe, expect, it, vi } from 'vitest';
import { normalizePaged, readNumber, readString } from './normalize';

const request = { page: 2, pageSize: 10 };
const id = (item: unknown) => readString(item, 'id');

describe('normalizePaged', () => {
  it('reads the spec envelope', () => {
    const paged = normalizePaged(
      { items: [{ id: 'a' }], page: 2, pageSize: 10, totalCount: 11, totalPages: 2 },
      id,
      request,
      'test',
    );
    expect(paged).toEqual({ items: ['a'], page: 2, pageSize: 10, totalCount: 11, totalPages: 2 });
  });

  it('accepts variants and bare arrays', () => {
    expect(normalizePaged({ data: [{ id: 'x' }], total: 25 }, id, request, 'test')).toMatchObject({
      items: ['x'],
      totalCount: 25,
      totalPages: 3,
    });
    expect(normalizePaged([{ id: 'y' }], id, request, 'test').items).toEqual(['y']);
  });

  it('returns an empty page instead of throwing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(normalizePaged({ error: 'x' }, id, request, 'test').items).toEqual([]);
  });
});

describe('read helpers', () => {
  it('follow dotted paths and coerce numbers', () => {
    expect(readString({ guardian: { fullName: 'أحمد' } }, 'guardian.fullName')).toBe('أحمد');
    expect(readNumber({ balance: '350.5' }, 'balance')).toBe(350.5);
    expect(readNumber({}, 'missing')).toBeNull();
  });
});
