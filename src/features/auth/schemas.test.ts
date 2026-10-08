import { describe, expect, it } from 'vitest';
import { ar } from '@/i18n/ar';
import {
  loginSchema,
  newPasswordSchema,
  normalizeDigits,
  otpCodeSchema,
  phoneSchema,
  portalIdentifySchema,
  resetPasswordSchema,
} from './schemas';

describe('phoneSchema', () => {
  it.each(['01012345678', '01112345678', '01212345678', '01512345678'])('accepts %s', (phone) => {
    expect(phoneSchema.parse(phone)).toBe(phone);
  });

  it('normalizes Arabic-Indic digits and spaces', () => {
    expect(phoneSchema.parse('٠١٠ ١٢٣٤ ٥٦٧٨')).toBe('01012345678');
  });

  it.each(['01312345678', '0101234567', '010123456789', '+201012345678', '21012345678'])(
    'rejects %s',
    (phone) => {
      expect(phoneSchema.safeParse(phone).success).toBe(false);
    },
  );

  it('reports "required" for empty input', () => {
    const result = phoneSchema.safeParse('  ');
    expect(result.error?.issues[0]?.message).toBe(ar.validation.required);
  });
});

describe('newPasswordSchema', () => {
  it('requires 8+ chars with a letter and a digit', () => {
    expect(newPasswordSchema.safeParse('abc12345').success).toBe(true);
    expect(newPasswordSchema.safeParse('كلمةسر12').success).toBe(true);
    expect(newPasswordSchema.safeParse('abc123').success).toBe(false);
    expect(newPasswordSchema.safeParse('abcdefgh').success).toBe(false);
    expect(newPasswordSchema.safeParse('12345678').success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('only checks the password is present (strength applies on reset)', () => {
    const result = loginSchema.safeParse({
      phone: '01012345678',
      password: 'x',
      rememberMe: false,
    });
    expect(result.success).toBe(true);
  });
});

describe('portalIdentifySchema', () => {
  it('validates only the phone for guardians', () => {
    const result = portalIdentifySchema.parse({
      as: 'guardian',
      phone: '01112345678',
      studentCode: '',
      rememberMe: true,
    });
    expect(result.identity).toEqual({ phone: '01112345678' });
  });

  it('validates and upper-cases the code for students', () => {
    const result = portalIdentifySchema.parse({
      as: 'student',
      phone: '',
      studentCode: 'f-1024',
      rememberMe: false,
    });
    expect(result.identity).toEqual({ studentCode: 'F-1024' });
  });

  it('puts the error on the active field', () => {
    const result = portalIdentifySchema.safeParse({
      as: 'student',
      phone: '',
      studentCode: '',
      rememberMe: false,
    });
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual(['studentCode']);
  });
});

describe('otpCodeSchema', () => {
  it('accepts 6 digits incl. Arabic-Indic', () => {
    expect(otpCodeSchema.parse('١٢٣٤٥٦')).toBe('123456');
    expect(otpCodeSchema.safeParse('12345').success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('flags mismatched confirmation on confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'abc12345',
      confirmPassword: 'abc12346',
    });
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});

describe('normalizeDigits', () => {
  it('converts Persian digits too', () => {
    expect(normalizeDigits('۰۱۲')).toBe('012');
  });
});
