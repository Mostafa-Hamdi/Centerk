'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/feedback/toast';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { loggedOut } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { useLogoutMutation } from '../api';

/** Revokes the refresh token (BFF clears the cookie), wipes the store, goes to /login. */
export function LogoutButton(props: Omit<ButtonProps, 'onClick' | 'loading'>) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const onClick = async () => {
    try {
      await logout(undefined).unwrap();
    } catch {
      // Local logout still happens; the server session expires on its own.
    }
    dispatch(loggedOut());
    toast.info(ar.auth.session.loggedOut);
    router.replace(routes.login);
  };

  return (
    <Button
      variant="neutral"
      iconStart={<LogOut aria-hidden />}
      {...props}
      loading={isLoading}
      onClick={() => void onClick()}
    >
      {props.children ?? ar.auth.session.logout}
    </Button>
  );
}
