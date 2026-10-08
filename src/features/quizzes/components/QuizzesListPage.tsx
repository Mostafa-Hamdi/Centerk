'use client';

import { BookOpenCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery } from '@/features/groups/api';
import { ar } from '@/i18n/ar';
import { formatDate, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetQuizzesQuery } from '../api';

const t = ar.quizzes;
const ALL = 'all';

/** /quizzes — quizzes per group (live GET /quizzes?groupId), group filter kept in the URL. */
export function QuizzesListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const groupId = useSearchParams().get('groupId') ?? undefined;
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const { data, isLoading, error, refetch } = useGetQuizzesQuery(groupId);
  const options = [
    { value: ALL, label: t.allGroups },
    ...(groups.data?.items ?? []).map((group) => ({ value: group.id, label: group.name })),
  ];

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <Can permission="quizzes.create">
          <Link
            href={groupId ? `${routes.quizzes.new}?groupId=${groupId}` : routes.quizzes.new}
            className={buttonVariants({ size: 'lg' })}
          >
            <Plus className="size-4" aria-hidden />
            {t.add}
          </Link>
        </Can>
      </header>

      <div className="w-full max-w-sm">
        <Select
          aria-label={ar.groups.title}
          value={groupId ?? ALL}
          onValueChange={(value) =>
            router.replace(value === ALL ? pathname : `${pathname}?groupId=${value}`, {
              scroll: false,
            })
          }
          options={options}
        />
      </div>

      {error ? (
        <ErrorState
          title={ar.list.loadError}
          description={toProblem(error).title}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : data?.length ? (
        <div className="grid gap-(--shell-gap) md:grid-cols-2 xl:grid-cols-3">
          {data.map((quiz) => (
            <Card key={quiz.id} interactive className="relative flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display font-semibold text-ink">{quiz.title}</h2>
                <Badge tone={quiz.status === 'Published' ? 'success' : 'neutral'} dot>
                  {t.status[quiz.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted">{quiz.groupName ?? ''}</p>
              <p className="flex justify-between text-sm text-muted">
                <span>{quiz.createdAt ? formatDate(quiz.createdAt) : ''}</span>
                <span className="tabular">
                  {t.average}:{' '}
                  {quiz.average === null ? '—' : formatNumber(Math.round(quiz.average * 10) / 10)}{' '}
                  {t.maxOf(quiz.maxScore)}
                </span>
              </p>
              <Link
                href={routes.quizzes.detail(quiz.id)}
                className="absolute inset-0 rounded-lg"
                aria-label={quiz.title}
              />
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={BookOpenCheck} title={t.empty} description={t.emptyDesc} />
        </Card>
      )}
    </div>
  );
}
