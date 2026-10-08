import { describe, expect, it } from 'vitest';
import { ar } from '@/i18n/ar';
import { toProblem } from './problem-details';

describe('toProblem', () => {
  it('maps known codes to Arabic messages', () => {
    const problem = toProblem({ status: 409, data: { code: 'hall-clash', title: 'Hall clash' } });
    expect(problem).toMatchObject({
      status: 409,
      code: 'hall-clash',
      title: ar.errors.codes['hall-clash'],
    });
  });

  it('derives the code from the type URL', () => {
    const problem = toProblem({
      status: 409,
      data: { type: 'https://docs.centerak.app/errors/group-full' },
    });
    expect(problem.code).toBe('group-full');
  });

  it('keeps an Arabic server title for unknown codes', () => {
    const problem = toProblem({
      status: 409,
      data: { code: 'something-new', title: 'رسالة من السيرفر' },
    });
    expect(problem.title).toBe('رسالة من السيرفر');
  });

  it('falls back to a status message for English titles', () => {
    const problem = toProblem({
      status: 400,
      data: { title: 'One or more validation errors occurred.' },
    });
    expect(problem.title).toBe(ar.errors.validation);
  });

  it('normalizes field error keys to camelCase paths', () => {
    const problem = toProblem({
      status: 400,
      data: { errors: { Phone: ['رقم غلط'], 'Guardian.FullName': ['مطلوب'], '$.school': ['x'] } },
    });
    expect(problem.fieldErrors).toEqual({
      phone: ['رقم غلط'],
      'guardian.fullName': ['مطلوب'],
      school: ['x'],
    });
  });

  it('handles network failures', () => {
    expect(toProblem({ status: 'FETCH_ERROR', error: 'TypeError' }).title).toBe(ar.errors.network);
  });

  it('handles non-HTTP errors', () => {
    expect(toProblem(new Error('boom')).title).toBe(ar.errors.unknown);
  });
});
