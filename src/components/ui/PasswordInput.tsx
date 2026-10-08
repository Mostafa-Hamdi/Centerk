'use client';

import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { ar } from '@/i18n/ar';
import { Input, type InputProps } from './Input';

/** Password input with an accessible show/hide toggle. */
export function PasswordInput(props: Omit<InputProps, 'type' | 'endAdornment'>) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      dir="ltr"
      startAdornment={props.startAdornment ?? <LockKeyhole aria-hidden />}
      endAdornment={
        <button
          type="button"
          onClick={() => {
            setVisible((value) => !value);
          }}
          aria-label={visible ? ar.common.hidePassword : ar.common.showPassword}
          aria-pressed={visible}
          className="flex size-10 items-center justify-center rounded-sm text-muted transition-colors hover:bg-primary-tint hover:text-primary"
        >
          <Icon className="size-5" aria-hidden />
        </button>
      }
    />
  );
}
