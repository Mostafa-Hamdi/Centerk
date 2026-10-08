'use client';

import { Building2 } from 'lucide-react';
import { useEffect } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormField } from '@/components/form/FormField';
import { Input } from '@/components/ui/Input';
import { ar } from '@/i18n/ar';

const STORAGE_KEY = 'ck.tenant';

/** Saves the center code after a successful submit so the next login is pre-filled. */
export function rememberTenantSlug(slug: string) {
  try {
    localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // storage unavailable
  }
}

interface TenantSlugFieldProps {
  registration: UseFormRegisterReturn<'tenantSlug'>;
  error?: string;
  /** Fills the field from the last login on this device (after mount, so SSR stays stable). */
  onRestore: (slug: string) => void;
}

/** "كود السنتر" — every live /auth endpoint needs the tenant slug. */
export function TenantSlugField({ registration, error, onRestore }: TenantSlugFieldProps) {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) onRestore(saved);
    } catch {
      // storage unavailable
    }
    // Restore once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormField
      label={ar.auth.login.tenantSlug}
      hint={ar.auth.login.tenantSlugHint}
      error={error}
      required
    >
      {(control) => (
        <Input
          {...control}
          {...registration}
          autoComplete="organization"
          autoCapitalize="none"
          spellCheck={false}
          dir="ltr"
          placeholder="alnour"
          startAdornment={<Building2 aria-hidden />}
        />
      )}
    </FormField>
  );
}
