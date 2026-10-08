import type { Paged } from './types';

/**
 * Helpers for the live API, whose responses have no Swagger schemas yet: read values by name with
 * aliases and never throw. Modules build their normalizers from these.
 */
export type Raw = Record<string, unknown>;

export const isObject = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** First path ("guardian.fullName") that holds a non-empty value. */
export function read(source: unknown, ...paths: string[]): unknown {
  for (const path of paths) {
    let current: unknown = source;
    for (const key of path.split('.')) current = isObject(current) ? current[key] : undefined;
    if (current !== undefined && current !== null && current !== '') return current;
  }
  return undefined;
}

export function readString(source: unknown, ...paths: string[]): string | null {
  const value = read(source, ...paths);
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
}

export function readNumber(source: unknown, ...paths: string[]): number | null {
  const value = read(source, ...paths);
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

const warned = new Set<string>();
/** Logs an unexpected live-API shape once per endpoint (development only). */
export function warnShape(endpoint: string, raw: unknown) {
  if (process.env.NODE_ENV === 'production' || warned.has(endpoint)) return;
  warned.add(endpoint);
  console.warn(`[api] ${endpoint}: unexpected response shape — please share it to map fields`, raw);
}

/**
 * Accepts the spec envelope `{items, page, pageSize, totalCount, totalPages}`, common variants
 * (`data`, `results`, `total`, `count`) or a bare array, and normalizes every item.
 */
export function normalizePaged<T>(
  raw: unknown,
  normalizeItem: (item: unknown, index: number) => T,
  request: { page: number; pageSize: number },
  endpoint: string,
): Paged<T> {
  const list = Array.isArray(raw) ? raw : read(raw, 'items', 'data', 'results', 'rows', 'value');
  if (!Array.isArray(list)) {
    warnShape(endpoint, raw);
    return {
      items: [],
      page: request.page,
      pageSize: request.pageSize,
      totalCount: 0,
      totalPages: 1,
    };
  }
  const pageSize = readNumber(raw, 'pageSize', 'size', 'limit') ?? request.pageSize;
  const totalCount = readNumber(raw, 'totalCount', 'total', 'count', 'totalItems') ?? list.length;
  return {
    items: list.map(normalizeItem),
    page: readNumber(raw, 'page', 'pageNumber', 'currentPage') ?? request.page,
    pageSize,
    totalCount,
    totalPages:
      readNumber(raw, 'totalPages', 'pageCount') ?? Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}
