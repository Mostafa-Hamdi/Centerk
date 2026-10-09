import { describe, expect, it } from 'vitest';
import { guessMapping } from './importApi';

describe('guessMapping', () => {
  it('maps Arabic headers, guardian phone before guardian name', () => {
    expect(
      guessMapping(['اسم الطالب', 'موبايل ولي الأمر', 'اسم ولي الأمر', 'الصف', 'المدرسة']),
    ).toEqual({
      fullName: 'اسم الطالب',
      parentPhone: 'موبايل ولي الأمر',
      parentName: 'اسم ولي الأمر',
      gradeLevel: 'الصف',
      school: 'المدرسة',
    });
  });

  it('maps English headers and never reuses a column', () => {
    const mapping = guessMapping(['Student Name', 'Phone', 'Parent Phone', 'Code']);
    expect(mapping).toMatchObject({
      fullName: 'Student Name',
      phone: 'Phone',
      parentPhone: 'Parent Phone',
      code: 'Code',
    });
    expect(new Set(Object.values(mapping)).size).toBe(Object.values(mapping).length);
  });

  it('leaves unknown columns unmapped', () => {
    expect(guessMapping(['xyz', 'abc'])).toEqual({});
  });
});
