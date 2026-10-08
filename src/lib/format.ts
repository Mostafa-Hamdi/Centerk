import { formatDistanceToNow } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';
import { ar } from '@/i18n/ar';

export const LOCALE = 'ar-EG';
/** Branch time zone per backend-spec §4 — fixed so SSR and client render identically. */
export const TIME_ZONE = 'Africa/Cairo';

type DateInput = Date | string | number;

const numberFormat = new Intl.NumberFormat(LOCALE);
const moneyFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const dateFormats = {
  short: new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeZone: TIME_ZONE }),
  medium: new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeZone: TIME_ZONE }),
  long: new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long', timeZone: TIME_ZONE }),
} as const;
const timeFormat = new Intl.DateTimeFormat(LOCALE, { timeStyle: 'short', timeZone: TIME_ZONE });
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value));

/** 1234.5 → "١٬٢٣٤٫٥" */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** 1500 → "١٬٥٠٠ ج.م" (EGP only, per backend-spec §4). */
export function formatMoney(value: number): string {
  return `${moneyFormat.format(value)} ${ar.currency.egp}`;
}

/** 0.874 → "٨٧٪" — takes a ratio (0–1). */
export function formatPercent(ratio: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits }).format(ratio);
}

export function formatDate(value: DateInput, style: keyof typeof dateFormats = 'medium'): string {
  return dateFormats[style].format(toDate(value));
}

export function formatTime(value: DateInput): string {
  return timeFormat.format(toDate(value));
}

export function formatDateTime(value: DateInput): string {
  return dateTimeFormat.format(toDate(value));
}

/** "منذ ٥ دقائق" style relative time (date-fns words, Arabic-Indic digits like the rest of the UI). */
export function formatRelative(value: DateInput): string {
  return formatDistanceToNow(toDate(value), { addSuffix: true, locale: arLocale }).replace(
    /\d/g,
    (digit) => formatNumber(Number(digit)),
  );
}

/**
 * Egyptian mobile for display: "+201012345678" / "01012345678" → "0101 234 5678".
 * Masked values from the API (e.g. "010****5678") and unknown formats pass through untouched.
 * Render inside an element with dir="ltr".
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const local = digits.startsWith('20') && digits.length === 12 ? `0${digits.slice(2)}` : digits;
  if (!/^01[0125]\d{8}$/.test(local)) return phone;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
