'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from '@/components/feedback/toast';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { sessionReceived } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { authApi } from '../api';
import { safeNextPath } from '../session';
import type { ClientSession } from '../types';

/** After tokens arrive: store the access token, load /me, greet, then go to `?next=` or home. */
export function useCompleteLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(
    async (session: ClientSession) => {
      dispatch(sessionReceived(session));
      const request = dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
      try {
        const me = await request.unwrap();
        toast.success(
          ar.auth.login.success(me.fullName.split(' ')[0] ?? me.fullName),
          ar.auth.login.successDesc,
        );
        const fallback = me.kind === 'Staff' ? routes.dashboard : routes.portal.home;
        const next = safeNextPath(new URLSearchParams(window.location.search).get('next'));
        router.replace(next ?? fallback);
      } finally {
        request.unsubscribe();
      }
    },
    [dispatch, router],
  );
}
