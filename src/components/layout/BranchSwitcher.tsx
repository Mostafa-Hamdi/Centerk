'use client';

import { Building, ChevronDown } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from '@/components/feedback/toast';
import {
  Dropdown,
  DropdownContent,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownTrigger,
} from '@/components/ui/Dropdown';
import { ar } from '@/i18n/ar';
import { api, tagTypes } from '@/services/api';
import { branchChanged, selectCurrentBranchId, selectMe } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const STORAGE_KEY = 'ck.branch';

/** Active branch → X-Branch-Id header on every backend call. Switching refetches branch data. */
export function BranchSwitcher() {
  const dispatch = useAppDispatch();
  const branches = useAppSelector(selectMe)?.branches ?? [];
  const currentId = useAppSelector(selectCurrentBranchId);
  const current = branches.find((branch) => branch.id === currentId);

  // Restore the last branch used on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== currentId && branches.some((branch) => branch.id === saved)) {
        dispatch(branchChanged(saved));
      }
    } catch {
      // storage unavailable
    }
    // Run once when the branch list arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.length]);

  if (branches.length < 2) return null;

  const select = (id: string) => {
    if (id === currentId) return;
    dispatch(branchChanged(id));
    dispatch(api.util.invalidateTags(tagTypes.filter((tag) => tag !== 'Me')));
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // storage unavailable
    }
    const name = branches.find((branch) => branch.id === id)?.name ?? '';
    toast.info(ar.shell.branchChanged(name));
  };

  return (
    <Dropdown>
      <DropdownTrigger
        aria-label={`${ar.shell.switchBranch}: ${current?.name ?? ''}`}
        className="hidden min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-primary md:flex"
      >
        <Building className="size-4 text-cyan-deep" aria-hidden />
        <span className="max-w-32 truncate">{current?.name}</span>
        <ChevronDown className="size-4 text-muted" aria-hidden />
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>{ar.shell.branch}</DropdownLabel>
        <DropdownRadioGroup value={currentId ?? ''} onValueChange={select}>
          {branches.map((branch) => (
            <DropdownRadioItem key={branch.id} value={branch.id}>
              {branch.name}
            </DropdownRadioItem>
          ))}
        </DropdownRadioGroup>
      </DropdownContent>
    </Dropdown>
  );
}
