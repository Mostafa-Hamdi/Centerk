'use client';

import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { useGetRolesQuery } from '@/features/roles/api';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { useSetUserRoleMutation } from '../api';

const t = ar.staffRole;
const NONE = 'none';

/** Assigns a custom role to a staff member (PUT /users/{id}/roles) or reverts to the base role. */
export function StaffRoleCard({ userId }: { userId: string }) {
  const branchId = useAppSelector(selectCurrentBranchId);
  const roles = useGetRolesQuery({ page: 1, pageSize: 100, filters: {} });
  const [setRole, saving] = useSetUserRoleMutation();
  const [roleId, setRoleId] = useState(NONE);

  const save = async () => {
    try {
      await setRole({
        userId,
        roleId: roleId === NONE ? null : roleId,
        branchId: branchId ?? undefined,
      }).unwrap();
      toast.success(t.saved);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <Can permission="roles.manage">
      <Card className="mx-auto flex w-full max-w-5xl flex-col gap-3 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <ShieldCheck className="size-5 text-primary" aria-hidden />
          {t.title}
        </h2>
        <p className="text-sm text-muted">{t.hint}</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-80">
            <Select
              aria-label={t.title}
              value={roleId}
              onValueChange={setRoleId}
              options={[
                { value: NONE, label: t.none },
                ...(roles.data?.items ?? [])
                  .filter((role) => role.isActive)
                  .map((role) => ({ value: role.id, label: role.name })),
              ]}
            />
          </div>
          <Button loading={saving.isLoading} onClick={() => void save()}>
            {t.save}
          </Button>
        </div>
      </Card>
    </Can>
  );
}
