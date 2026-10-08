import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ar } from '@/i18n/ar';
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';

function Harness(props: Partial<ConfirmDialogProps> & Pick<ConfirmDialogProps, 'onConfirm'>) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <p data-testid="state">{open ? 'open' : 'closed'}</p>
      <ConfirmDialog open={open} onOpenChange={setOpen} itemName="سلمى نصر" {...props} />
    </>
  );
}

const confirmButton = () => screen.getByRole('button', { name: ar.common.delete });

describe('ConfirmDialog', () => {
  it('shows the item name and closes after a successful confirm', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    render(<Harness onConfirm={onConfirm} />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent('«سلمى نصر»');

    await userEvent.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledWith(undefined);
    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('closed');
    });
  });

  it('stays open when the action fails', async () => {
    render(<Harness onConfirm={() => Promise.reject(new Error('409'))} />);
    await userEvent.click(confirmButton());
    await waitFor(() => {
      expect(confirmButton()).not.toHaveAttribute('aria-busy');
    });
    expect(screen.getByTestId('state')).toHaveTextContent('open');
  });

  it('requires a reason for void flows and passes it on', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    render(<Harness onConfirm={onConfirm} requireReason />);

    await userEvent.click(confirmButton());
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(ar.confirm.reasonRequired);

    await userEvent.type(screen.getByLabelText(new RegExp(ar.confirm.reason)), 'إيصال مكرر');
    await userEvent.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledWith('إيصال مكرر');
  });

  it('enables the button only after the name is typed', async () => {
    render(<Harness onConfirm={() => Promise.resolve()} requireTypedName />);
    expect(confirmButton()).toBeDisabled();
    await userEvent.type(screen.getByLabelText(ar.confirm.typeToConfirm('سلمى نصر')), 'سلمى نصر');
    expect(confirmButton()).toBeEnabled();
  });

  it('closes on Escape', async () => {
    render(<Harness onConfirm={() => Promise.resolve()} />);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('closed');
    });
  });
});
