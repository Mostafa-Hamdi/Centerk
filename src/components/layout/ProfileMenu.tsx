'use client';

import { ChevronDown, Crown, KeyRound, LogOut, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/feedback/toast';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/Dropdown';
import { routes } from '@/config/routes';
import { useLogoutMutation } from '@/features/auth/api';
import { ar } from '@/i18n/ar';
import { tagTypes, api } from '@/services/api';
import { branchChanged, loggedOut, selectCurrentBranchId, selectMe } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Avatar menu: account, plan, branch switch, logout. */
export function ProfileMenu() {
  const me = useAppSelector(selectMe);
  const currentBranchId = useAppSelector(selectCurrentBranchId);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  if (!me) return null;

  const initials = me.fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');

  const onLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } catch {
      // local logout still happens
    }
    dispatch(loggedOut());
    toast.info(ar.auth.session.loggedOut);
    router.replace(routes.login);
  };

  return (
    <Dropdown>
      <DropdownTrigger
        aria-label={ar.shell.profile}
        className="flex min-h-11 items-center gap-2 rounded-md ps-1 pe-2 transition-colors hover:bg-primary-tint"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-ink">
          {initials}
        </span>
        <span className="hidden flex-col items-start leading-tight xl:flex">
          <span className="max-w-36 truncate text-sm font-semibold text-ink">{me.fullName}</span>
          <span className="text-xs text-muted">{me.roles[0]?.name}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted xl:block" aria-hidden />
      </DropdownTrigger>
      <DropdownContent className="w-72">
        <div className="px-3 py-2">
          <p className="truncate font-semibold text-ink">{me.fullName}</p>
          <p className="truncate text-xs text-muted">{me.tenant.name}</p>
        </div>
        <DropdownSeparator />
        <DropdownItem onSelect={() => router.push(routes.settings.root)}>
          <UserRound aria-hidden />
          {ar.shell.account}
        </DropdownItem>
        <DropdownItem onSelect={() => router.push(routes.account.password)}>
          <KeyRound aria-hidden />
          {ar.account.password}
        </DropdownItem>
        <DropdownItem onSelect={() => router.push(routes.settings.root)}>
          <Crown aria-hidden className="text-warning" />
          {ar.shell.plan(me.tenant.plan)}
        </DropdownItem>
        {me.branches.length > 1 ? (
          <>
            <DropdownSeparator />
            <DropdownLabel>{ar.shell.switchBranch}</DropdownLabel>
            <DropdownRadioGroup
              value={currentBranchId ?? ''}
              onValueChange={(id) => {
                dispatch(branchChanged(id));
                dispatch(api.util.invalidateTags(tagTypes.filter((tag) => tag !== 'Me')));
              }}
            >
              {me.branches.map((branch) => (
                <DropdownRadioItem key={branch.id} value={branch.id}>
                  {branch.name}
                </DropdownRadioItem>
              ))}
            </DropdownRadioGroup>
          </>
        ) : null}
        <DropdownSeparator />
        <DropdownItem
          onSelect={() => void onLogout()}
          className="text-danger data-highlighted:bg-danger-tint data-highlighted:text-danger"
        >
          <LogOut aria-hidden />
          {ar.auth.session.logout}
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
