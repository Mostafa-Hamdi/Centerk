import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatMoney,
  formatNumber,
  formatPercent,
  formatPhone,
  formatRelative,
} from './format';

describe('formatNumber', () => {
  it('uses ar-EG digits and separators', () => {
    expect(formatNumber(1234.5)).toBe('١٬٢٣٤٫٥');
  });
});

describe('formatMoney', () => {
  it('appends ج.م and drops trailing zero fractions', () => {
    expect(formatMoney(1500)).toBe('١٬٥٠٠ ج.م');
  });

  it('keeps up to two decimals', () => {
    expect(formatMoney(99.456)).toBe('٩٩٫٤٦ ج.م');
  });
});

describe('formatPercent', () => {
  it('formats a ratio', () => {
    expect(formatPercent(0.874)).toContain('٨٧');
  });
});

describe('formatDate', () => {
  it('formats in the Cairo time zone regardless of the machine zone', () => {
    // 23:30 UTC on Oct 7 is already Oct 8 in Cairo.
    const formatted = formatDate('2026-10-07T23:30:00Z', 'long');
    expect(formatted).toContain('٨');
    expect(formatted).toContain('أكتوبر');
    expect(formatted).toContain('٢٠٢٦');
  });
});

describe('formatRelative', () => {
  it('uses Arabic words and Arabic-Indic digits', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000);
    const formatted = formatRelative(fiveMinutesAgo);
    expect(formatted).toMatch(/[٠-٩]/);
    expect(formatted).not.toMatch(/[0-9]/);
  });
});

describe('formatPhone', () => {
  it('groups a local Egyptian mobile', () => {
    expect(formatPhone('01012345678')).toBe('0101 234 5678');
  });

  it('converts E.164 (+20) to local display', () => {
    expect(formatPhone('+201112345678')).toBe('0111 234 5678');
  });

  it('passes masked phones through untouched', () => {
    expect(formatPhone('010****5678')).toBe('010****5678');
  });

  it('passes unknown formats through untouched', () => {
    expect(formatPhone('0223456789')).toBe('0223456789');
  });
});
