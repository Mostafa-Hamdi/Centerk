'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { inputClasses } from '@/components/ui/Input';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Shown in bold inside the question. */
  itemName: string;
  /** Question before the bold name; defaults to «متأكد إنك عايز تحذف». */
  questionPrefix?: string;
  /** Consequence text, e.g. "هيتشال من كل المجموعات". */
  description?: ReactNode;
  confirmLabel?: string;
  /** danger = delete/void (default) · warning = postpone/reopen/override. */
  tone?: Extract<ButtonProps['variant'], 'danger' | 'warning'>;
  /** High-risk entities: user must type the item name to enable the button. */
  requireTypedName?: boolean;
  /** Void/cancel flows (backend-spec §4): a reason is mandatory and passed to onConfirm. */
  requireReason?: boolean;
  /** Dialog stays open with a spinner until this settles; it closes on success. */
  onConfirm: (reason?: string) => Promise<unknown>;
}

/**
 * Reusable destructive-action confirmation: blurred backdrop, spring scale-in, self-drawing
 * warning icon, optional type-to-confirm and mandatory reason. Esc / cancel close it.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = ar.confirm.deleteTitle,
  itemName,
  questionPrefix = ar.confirm.questionPrefix,
  description = ar.confirm.irreversible,
  confirmLabel = ar.common.delete,
  tone = 'danger',
  requireTypedName = false,
  requireReason = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [busy, setBusy] = useState(false);
  const typedId = useId();
  const reasonId = useId();

  useEffect(() => {
    if (!open) {
      setTyped('');
      setReason('');
      setReasonError(false);
      setBusy(false);
    }
  }, [open]);

  const nameMatches = !requireTypedName || typed.trim() === itemName.trim();
  const danger = tone === 'danger';

  const confirm = async () => {
    if (requireReason && reason.trim().length < 5) {
      setReasonError(true);
      return;
    }
    setBusy(true);
    try {
      await onConfirm(requireReason ? reason.trim() : undefined);
      onOpenChange(false);
    } catch {
      // Caller shows the error toast; keep the dialog open so the user can retry.
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !busy && onOpenChange(value)}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-50 grid place-items-center p-4">
              <Dialog.Content asChild forceMount>
                <m.div
                  role="alertdialog"
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className="flex w-full max-w-md flex-col items-center rounded-xl border border-line bg-surface p-6 text-center shadow-lift sm:p-7"
                >
                  <span
                    className={cn(
                      'mb-5 flex size-14 items-center justify-center rounded-lg',
                      danger ? 'bg-danger-tint text-danger' : 'bg-warning-tint text-warning',
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
                      <m.path
                        d="M12 3 2.5 20h19L12 3Z"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.55, delay: 0.1, ease: 'easeInOut' }}
                      />
                      <m.path
                        d="M12 10v4.5M12 17.4v.1"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                      />
                    </svg>
                  </span>

                  <Dialog.Title className="font-display text-xl font-bold text-ink">
                    {title}
                  </Dialog.Title>
                  <Dialog.Description asChild>
                    <div className="mt-2 flex flex-col gap-1 text-muted">
                      <p>
                        {questionPrefix}{' '}
                        <strong className="font-semibold text-ink">«{itemName}»</strong>
                        {ar.confirm.questionSuffix}
                      </p>
                      {description ? <p className="text-sm">{description}</p> : null}
                    </div>
                  </Dialog.Description>

                  {requireReason ? (
                    <div className="mt-5 flex w-full flex-col gap-2">
                      <label htmlFor={reasonId} className="text-sm font-medium text-ink">
                        {ar.confirm.reason}
                        <span aria-hidden className="ms-1 text-danger">
                          *
                        </span>
                      </label>
                      <textarea
                        id={reasonId}
                        value={reason}
                        onChange={(event) => {
                          setReason(event.target.value);
                          if (reasonError) setReasonError(false);
                        }}
                        rows={3}
                        aria-invalid={reasonError}
                        aria-required
                        placeholder={ar.confirm.reasonPlaceholder}
                        className={cn(inputClasses, 'h-auto py-3')}
                      />
                      {reasonError ? (
                        <p role="alert" className="text-sm text-danger">
                          {ar.confirm.reasonRequired}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {requireTypedName ? (
                    <div className="mt-5 flex w-full flex-col gap-2">
                      <label htmlFor={typedId} className="text-sm font-medium text-ink">
                        {ar.confirm.typeToConfirm(itemName)}
                      </label>
                      <input
                        id={typedId}
                        value={typed}
                        onChange={(event) => setTyped(event.target.value)}
                        autoComplete="off"
                        aria-invalid={typed.length > 0 && !nameMatches}
                        className={inputClasses}
                      />
                    </div>
                  ) : null}

                  <div className="mt-7 flex w-full flex-col-reverse justify-center gap-3 sm:flex-row">
                    <Dialog.Close asChild>
                      <Button variant="neutral" disabled={busy}>
                        {ar.common.cancel}
                      </Button>
                    </Dialog.Close>
                    <Button
                      variant={tone}
                      loading={busy}
                      disabled={!nameMatches}
                      onClick={() => void confirm()}
                    >
                      {confirmLabel}
                    </Button>
                  </div>
                </m.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
