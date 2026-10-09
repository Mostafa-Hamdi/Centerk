'use client';

import type { RowSelectionState } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BulkActionsBar } from '@/components/data/BulkActionsBar';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { api } from '@/services/api';
import type { tagTypes } from '@/services/api';
import { read } from '@/services/normalize';

type Tag = (typeof tagTypes)[number];

/** POST /{resource}/bulk-delete {ids} → per-item results ({ id, ok }). */
const bulkApi = api.injectEndpoints({
  endpoints: (build) => ({
    bulkDelete: build.mutation<{ failed: number }, { resource: string; ids: string[]; tag: Tag }>({
      query: ({ resource, ids }) => ({
        url: `/${resource}/bulk-delete`,
        method: 'POST',
        body: { ids },
      }),
      transformResponse: (raw: unknown) => {
        const items = Array.isArray(raw) ? raw : read(raw, 'items', 'results');
        return {
          failed: Array.isArray(items)
            ? (items as unknown[]).filter((item) => read(item, 'ok') === false).length
            : 0,
        };
      },
      invalidatesTags: (_result, _error, { tag }) => [{ type: tag, id: 'LIST' }],
    }),
  }),
});

const { useBulkDeleteMutation } = bulkApi;

/** Selection state + floating bar with a confirmed bulk archive for any catalogue list. */
export function useBulkSelection() {
  const [selection, setSelection] = useState<RowSelectionState>({});
  return { selection, setSelection, ids: Object.keys(selection) };
}

export function BulkDeleteBar({
  resource,
  tag,
  ids,
  onDone,
}: {
  resource: string;
  tag: Tag;
  ids: string[];
  onDone: () => void;
}) {
  const [bulkDelete] = useBulkDeleteMutation();
  const [open, setOpen] = useState(false);
  if (!ids.length) return null;
  return (
    <>
      <BulkActionsBar count={ids.length} onClear={onDone}>
        <Button
          size="sm"
          variant="danger"
          iconStart={<Trash2 aria-hidden />}
          onClick={() => setOpen(true)}
        >
          {ar.common.delete}
        </Button>
      </BulkActionsBar>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        itemName={ar.list.selectedItems(ids.length)}
        onConfirm={async () => {
          try {
            const result = await bulkDelete({ resource, ids, tag }).unwrap();
            if (result.failed)
              toast.warning(ar.list.bulkDone(ids.length - result.failed, result.failed));
            else toast.success(ar.common.delete, ar.list.selectedItems(ids.length));
            onDone();
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </>
  );
}
