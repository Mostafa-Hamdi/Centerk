'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ar } from '@/i18n/ar';
import { useShake } from '../hooks/useShake';
import { AuthCard } from './AuthCard';
import { StaffLoginForm } from './StaffLoginForm';

const t = ar.auth.login;

// Hidden tab (OTP flow): loaded on first open / hover so the default staff form ships less JS.
const loadPortalForm = () => import('./PortalLoginForm').then((mod) => mod.PortalLoginForm);
const PortalLoginForm = dynamic(loadPortalForm, {
  loading: () => <Skeleton className="h-80 w-full rounded-lg" />,
});

/** /login: team tab (phone + password) and guardian/student tab (OTP). Shakes on failure. */
export function LoginCard() {
  const [tab, setTab] = useState('staff');
  const [cardRef, shake] = useShake();

  return (
    <AuthCard ref={cardRef} title={t.title} subtitle={t.subtitle}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList label={t.tabsLabel} className="mb-6">
          <TabsTrigger value="staff">{t.staffTab}</TabsTrigger>
          <TabsTrigger value="portal" onIntent={() => void loadPortalForm()}>
            {t.portalTab}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <StaffLoginForm onFailure={shake} />
        </TabsContent>
        <TabsContent value="portal">
          <PortalLoginForm onFailure={shake} />
        </TabsContent>
      </Tabs>
    </AuthCard>
  );
}
