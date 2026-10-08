/** Paged envelope — backend-spec §18. */
export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** Common list query — backend-spec §10: `?search=&page=1&pageSize=20&sort=field,-field2` + filters. */
export interface ListParams {
  search?: string;
  page: number;
  pageSize: number;
  /** e.g. "fullName,-createdAt" */
  sort?: string;
  filters: Record<string, string>;
}

/** Flattens ListParams into the query string the backend expects (empty values dropped). */
export function toQueryParams({ search, page, pageSize, sort, filters }: ListParams) {
  const params: Record<string, string | number> = { page, pageSize };
  if (search) params.search = search;
  if (sort) params.sort = sort;
  for (const [key, value] of Object.entries(filters)) if (value) params[key] = value;
  return params;
}
