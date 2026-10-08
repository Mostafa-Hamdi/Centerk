import { describe, expect, it } from 'vitest';
import { ar } from '@/i18n/ar';
import { studentEditSchema, studentFormSchema } from './schemas';

const valid = {
  fullName: 'سلمى إبراهيم نصر',
  phone: '01067771010',
  grade: 'الثالث الثانوي',
  guardian: { fullName: 'إبراهيم نصر', phone: '01093332211', relation: 'Father' as const },
  guardianConsent: true,
};

const paths = (result: { error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('studentFormSchema', () => {
  it('accepts the backend-spec example body', () => {
    expect(studentFormSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a full name of at least 3 words', () => {
    const result = studentFormSchema.safeParse({ ...valid, fullName: 'سلمى نصر' });
    expect(result.error?.issues[0]?.message).toBe(ar.validation.fullName);
  });

  it('enforces Swagger max lengths', () => {
    const result = studentFormSchema.safeParse({ ...valid, grade: 'x'.repeat(61) });
    expect(paths(result)).toEqual(['grade']);
  });

  it('treats an empty student phone as absent', () => {
    expect(studentFormSchema.parse({ ...valid, phone: '' }).phone).toBeUndefined();
  });

  it('requires guardian consent (Law 151/2020)', () => {
    expect(paths(studentFormSchema.safeParse({ ...valid, guardianConsent: false }))).toEqual([
      'guardianConsent',
    ]);
  });

  it('rejects a guardian phone equal to the student phone', () => {
    const result = studentFormSchema.safeParse({
      ...valid,
      guardian: { ...valid.guardian, phone: valid.phone },
    });
    expect(paths(result)).toEqual(['guardian.phone']);
  });

  it('validates guardian phone and relation', () => {
    const result = studentFormSchema.safeParse({
      ...valid,
      guardian: { fullName: 'إبراهيم نصر', phone: '123', relation: 'Neighbor' },
    });
    expect(paths(result)).toEqual(['guardian.phone', 'guardian.relation']);
  });
});

describe('studentEditSchema', () => {
  it('only covers the student fields (Swagger EditStudent)', () => {
    expect(studentEditSchema.parse(valid)).toEqual({
      fullName: valid.fullName,
      phone: valid.phone,
      grade: valid.grade,
    });
  });
});
