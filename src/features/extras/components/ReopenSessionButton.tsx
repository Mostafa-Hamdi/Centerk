'use client';

import { LockOpen } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { useReopenSessionMutation } from '../api';

const t = ar.extraSession;

/** Reopens a closed session (POST /sessions/{id}/reopen) with a mandatory reason. */
export function ReopenSessionButton({ sessionId, label }: { sessionId: string; label: string }) {
  const [reopen] = useReopenSessionMutation();
  const [open, setOpen] = useState(false);
  return (
    <Can permission="attendance.reopenSession">
      <Button
        size="sm"
        variant="warning"
        iconStart={<LockOpen aria-hidden />}
        onClick={() => setOpen(true)}
      >
        {t.reopen}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t.reopen}
        questionPrefix={t.reopenQuestion}
        itemName={label}
        description=""
        confirmLabel={t.reopen}
        tone="warning"
        requireReason
        onConfirm={async (reason) => {
          try {
            await reopen({ id: sessionId, reason: reason ?? '' }).unwrap();
            toast.success(t.reopened);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </Can>
  );
}
