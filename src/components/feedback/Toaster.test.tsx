import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ar } from '@/i18n/ar';
import { toast, toastStore } from './toast';
import { Toaster } from './Toaster';

afterEach(() => {
  act(() => {
    toastStore.getSnapshot().forEach((item) => {
      toast.dismiss(item.id);
    });
  });
});

describe('Toaster', () => {
  it('announces success politely and errors assertively', () => {
    render(<Toaster />);
    act(() => {
      toast.success('تم الحفظ', 'اتضاف الطالب');
      toast.error('فشل الحفظ');
    });
    expect(screen.getByRole('status')).toHaveTextContent('تم الحفظ');
    expect(screen.getByRole('alert')).toHaveTextContent('فشل الحفظ');
  });

  it('shows at most 3 toasts, newest first', () => {
    render(<Toaster />);
    act(() => {
      ['1', '2', '3', '4'].forEach((n) => toast.info(`toast ${n}`));
    });
    const items = screen.getAllByRole('status');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('toast 4');
  });

  it('dismisses from the close button', async () => {
    render(<Toaster />);
    act(() => {
      toast.info('رسالة');
    });
    await userEvent.click(screen.getByRole('button', { name: ar.toaster.dismiss }));
    await waitFor(() => {
      expect(screen.queryByText('رسالة')).not.toBeInTheDocument();
    });
  });

  it('turns a promise toast into success', async () => {
    render(<Toaster />);
    await act(async () => {
      await toast.promise(Promise.resolve(5), {
        loading: 'جارِ الحفظ',
        success: (value) => `تم ${value}`,
        error: 'فشل',
      });
    });
    expect(await screen.findByText('تم 5')).toBeInTheDocument();
    expect(screen.queryByText('جارِ الحفظ')).not.toBeInTheDocument();
  });
});
