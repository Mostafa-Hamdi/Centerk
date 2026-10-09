import {
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  Receipt,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { routes } from '@/config/routes';
import { api } from '@/services/api';
import { readString } from '@/services/normalize';

/** Global search — live GET /search?q= → [SearchItemDto{type,id,label,subtitle}] (Ctrl/⌘+K palette). */
export interface SearchResultDto {
  type: string;
  id: string;
  label: string;
  subtitle: string | null;
}

const searchApi = api.injectEndpoints({
  endpoints: (build) => ({
    globalSearch: build.query<SearchResultDto[], string>({
      query: (q) => ({ url: '/search', params: { q } }),
      transformResponse: (raw: unknown) =>
        Array.isArray(raw)
          ? (raw as unknown[])
              .map((item) => ({
                type: (readString(item, 'type') ?? '').toLowerCase(),
                id: readString(item, 'id') ?? '',
                label: readString(item, 'label', 'name', 'title') ?? '',
                subtitle: readString(item, 'subtitle'),
              }))
              .filter((item) => item.id && item.label)
          : [],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGlobalSearchQuery } = searchApi;

/** Where a result opens + its icon; unknown types are skipped. */
export function searchTarget(result: SearchResultDto): { href: string; icon: LucideIcon } | null {
  switch (result.type) {
    case 'student':
      return { href: routes.students.detail(result.id), icon: Users };
    case 'group':
      return { href: routes.groups.detail(result.id), icon: CalendarDays };
    case 'payment':
    case 'receipt':
      return { href: routes.payments.detail(result.id), icon: Receipt };
    case 'session':
      return { href: routes.attendance.session(result.id), icon: ClipboardCheck };
    case 'quiz':
      return { href: routes.quizzes.detail(result.id), icon: BookOpenCheck };
    default:
      return null;
  }
}
