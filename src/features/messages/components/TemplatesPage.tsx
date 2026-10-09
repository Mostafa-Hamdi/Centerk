'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Copy, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { useGetTemplatesQuery, useTemplateActionMutation, type TemplateDto } from '../api';
import { MessagesHeader } from './MessagesHeader';

const t = ar.messages.templates;

/** /messages/templates — message templates; system templates can be duplicated, not deleted. */
export function TemplatesPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetTemplatesQuery(list.params);
  const [run] = useTemplateActionMutation();
  const [deleting, setDeleting] = useState<TemplateDto | null>(null);

  const columns = useMemo<ColumnDef<TemplateDto>[]>(() => {
    const duplicate = async (template: TemplateDto) => {
      try {
        await run({ id: template.id, action: 'duplicate' }).unwrap();
        toast.success(t.duplicated, template.name);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      {
        accessorKey: 'name',
        header: t.columns.name,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2 font-medium">
              {row.original.name}
              {row.original.isSystem ? <Badge tone="primary">{t.system}</Badge> : null}
              {row.original.isActive ? null : <Badge>{t.inactive}</Badge>}
            </span>
            <span className="line-clamp-1 max-w-md text-xs text-muted">{row.original.body}</span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: t.columns.type,
        cell: ({ getValue }) => t.types[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'channel',
        header: t.columns.channel,
        cell: ({ getValue }) => ar.messages.channels[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'language',
        header: t.columns.language,
        cell: ({ getValue }) => t.languages[getValue<string>()] ?? getValue<string>(),
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Can permission="messages.update">
              <Link
                href={routes.messageTemplates.edit(row.original.id)}
                aria-label={`${ar.common.edit} ${row.original.name}`}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                <Pencil className="size-4" aria-hidden />
              </Link>
            </Can>
            <Can permission="messages.create">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.materials.duplicate} ${row.original.name}`}
                iconStart={<Copy aria-hidden />}
                onClick={() => void duplicate(row.original)}
              />
            </Can>
            {row.original.isSystem ? null : (
              <Can permission="messages.delete">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`${ar.common.delete} ${row.original.name}`}
                  iconStart={<Trash2 aria-hidden />}
                  onClick={() => setDeleting(row.original)}
                />
              </Can>
            )}
          </div>
        ),
      },
    ];
  }, [run]);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <MessagesHeader
        action={
          <Can permission="messages.create">
            <Link
              href={routes.messageTemplates.new}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Plus className="size-4" aria-hidden />
              {t.add}
            </Link>
          </Can>
        }
      />
      <section className="list-panel">
        <SearchInput
          value={list.params.search ?? ''}
          onSearch={list.setSearch}
          className="w-full max-w-sm"
        />
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          onRowClick={(row) => router.push(routes.messageTemplates.edit(row.id))}
          empty={<EmptyState icon={FileText} title={t.empty} />}
        />
        {data && data.totalCount > 0 ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={list.params.pageSize}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        ) : null}
      </section>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await run({ id: deleting.id, action: 'delete' }).unwrap();
            toast.success(t.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
