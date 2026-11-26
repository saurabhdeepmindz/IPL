'use client';

/**
 * @file    LocalSignInForm.tsx
 * @module  Auth
 *
 * @description
 * The password form. In plain words: employee code, password with show / hide, and the remember-code tick box.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/LocalSignInForm.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { useSignIn } from '../hooks/useSignIn';
import { signInSchema } from '../schemas/signInSchema';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import type { ApiError } from '@/lib/errors';
import type { z } from 'zod';

/**
 * LocalSignInForm.
 *
 * In plain words: the AMS password form
 *
 * @epic      EPIC-LGN-01
 * @story     US-LGN01-005
 * @subtask   ST-LGN01-005-FE-02
 * @workflow  UF-01
 * @screen    LGN-01
 * @contract  API-AUTH-01
 * @ac        AC-US-LGN01-005-02
 * @lld       LLD-EPIC-LGN-01 v0.4 §6.4
 * @status    built
 *
 * @returns nothing
 */
export function LocalSignInForm(props: { onError: (e: ApiError) => void; onAttempt?: () => void }) {
  const signIn = useSignIn();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, resetField, formState: { errors } } = useForm<z.infer<typeof signInSchema>>({ resolver: zodResolver(signInSchema), defaultValues: { employeeCode: '', password: '' } });
  const submit = handleSubmit((values) => {
    props.onAttempt?.();
    signIn.mutate(values, {
      onError: (error) => {
        resetField('password');
        props.onError(error);
      },
    });
  });
  return (
    <form onSubmit={submit} noValidate data-testid="local-sign-in-form" aria-label="Sign in with your AMS password">
      <Input label="Employee code" inputMode="numeric" autoComplete="username" maxLength={5} data-testid="employee-code" error={errors.employeeCode?.message} {...register('employeeCode')} />
      <Input label="Password" type={show ? 'text' : 'password'} autoComplete="current-password" data-testid="password" error={errors.password?.message} {...register('password')} />
      <div className="form-check mb-3">
        <input id="show-password" type="checkbox" className="form-check-input" checked={show} onChange={(e) => setShow(e.target.checked)} data-testid="show-password" />
        <label htmlFor="show-password" className="form-check-label">
          Show password
        </label>
      </div>
      <Button type="submit" className="w-100" isLoading={signIn.isPending} data-testid="sign-in-submit">
        Sign in
      </Button>
    </form>
  );
}
