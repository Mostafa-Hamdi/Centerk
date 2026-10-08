'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { Logo } from '@/components/ui/Logo';
import { ar } from '@/i18n/ar';
import { selectAccessToken, sessionReceived } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useGetMeQuery } from '../api';
import { redirectToLogin, refreshSession } from '../session';
import { LogoutButton } from './LogoutButton';

function SessionSplash() {
  return (
    <div role="status" className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Logo showWordmark={false} className="animate-pulse" />
      <p className="text-sm text-muted">{ar.auth.session.checking}</p>
    </div>
  );
}

/**
 * Guards the authenticated app. After a hard reload the access token is gone (memory only),
 * so we trade the refresh cookie for a new one, then load /me before rendering children.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const me = useGetMeQuery(undefined, { skip: !accessToken });
  // Token going from set → null means logout (navigation already underway): don't try to restore.
  const hadToken = useRef(false);

  useEffect(() => {
    if (accessToken) hadToken.current = true;
  }, [accessToken]);

  useEffect(() => {
    if (accessToken || hadToken.current) return;
    let cancelled = false;
    void refreshSession().then((result) => {
      if (cancelled) return;
      if (result.ok) dispatch(sessionReceived(result.session));
      else if (result.reason === 'unauthenticated') redirectToLogin();
      else setRestoreFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [accessToken, attempt, dispatch]);

  if (restoreFailed || me.isError) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <ErrorState
          title={ar.auth.session.failedTitle}
          description={ar.auth.session.failedDesc}
          retrying={me.isFetching}
          onRetry={() => {
            if (me.isError) {
              void me.refetch();
            } else {
              setRestoreFailed(false);
              setAttempt((value) => value + 1);
            }
          }}
          actions={<LogoutButton />}
        />
      </main>
    );
  }

  if (!accessToken || !me.data) return <SessionSplash />;
  return children;
}
