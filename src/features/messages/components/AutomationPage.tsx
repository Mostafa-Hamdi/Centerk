'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Switch } from '@/components/ui/Switch';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { BulkDeleteBar, useBulkSelection } from '@/features/extras/components/BulkDelete';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import {
  useDeleteAutomationRuleMutation,
  useGetAutomationRulesQuery,
  useGetTemplatesQuery,
  useSetAutomationActiveMutation,
  type AutomationRuleDto,
} from '../api';
import { MessagesHeader } from './MessagesHeader';

const t = ar.messages.automation;

/** /messages/automation — event → template rules with an optimistic on/off switch. */
export function AutomationPage() {
  const list = useListQueryParams();
  const bulk = useBulkSelection();
  const { data, isLoading, isFetching, error, refetch } = useGetAutomationRulesQuery(list.params);
  const templates = useGetTemplatesQuery({ page: 1, pageSize: 100, filters: {} });
  const [setActive] = useSetAutomationActiveMutation();
  const [remove] = useDeleteAutomationRuleMutation();
  const [deleting, setDeleting] = useState<AutomationRuleDto | null>(null);

  const columns = useMemo<ColumnDef<AutomationRuleDto>[]>(() => {
    const templateName = (id: string | null) =>
      (id && templates.data?.items.find((template) => template.id === id)?.name) ?? '—';
    const toggle = async (rule: AutomationRuleDto, isActive: boolean) => {
      try {
        await setActive({ id: rule.id, isActive, params: list.params }).unwrap();
        toast.success(t.toggled(isActive), rule.name);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      { accessorKey: 'name', header: t.columns.name },
      {
        accessorKey: 'event',
        header: t.columns.event,
        cell: ({ getValue }) => t.events[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'templateId',
        header: t.columns.template,
        cell: ({ getValue }) => templateName(getValue<string | null>()),
      },
      {
        accessorKey: 'timing',
        header: t.columns.timing,
        cell: ({ getValue }) => t.timings[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'isActive',
        header: t.columns.active,
        cell: ({ row }) => (
          <Can
            permission="messages.update"
            fallback={row.original.isActive ? t.columns.active : '—'}
          >
            <Switch
              checked={row.original.isActive}
              onCheckedChange={(checked) => void toggle(row.original, checked)}
              label={<span className="sr-only">{`${t.columns.active}: ${row.original.name}`}</span>}
            />
          </Can>
        ),
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Can permission="messages.update">
              <Link
                href={routes.automationRules.edit(row.original.id)}
                aria-label={`${ar.common.edit} ${row.original.name}`}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                <Pencil className="size-4" aria-hidden />
              </Link>
            </Can>
            <Can permission="messages.delete">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.delete} ${row.original.name}`}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => setDeleting(row.original)}
              />
            </Can>
          </div>
        ),
      },
    ];
  }, [templates.data, setActive, list.params]);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <MessagesHeader
        action={
          <Can permission="messages.create">
            <Link
              href={routes.automationRules.new}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Plus className="size-4" aria-hidden />
              {t.add}
            </Link>
          </Can>
        }
      />
      <section className="list-panel">
        <DataTable
          rowSelection={bulk.selection}
          onRowSelectionChange={bulk.setSelection}
          startIndex={((data?.page ?? 1) - 1) * list.params.pageSize}
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={Zap} title={t.empty} />}
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

      <Can permission="messages.delete">
        <BulkDeleteBar
          resource="automation-rules"
          tag="AutomationRule"
          ids={bulk.ids}
          onDone={() => bulk.setSelection({})}
        />
      </Can>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
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
