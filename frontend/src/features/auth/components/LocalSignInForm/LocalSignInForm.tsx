'use client';

/**
 * @file    LocalSignInForm.tsx
 * @module  Auth
 *
 * @description
 * Password form. In plain words: the form of the design with Show, Caps Lock hint and the remembered employee code.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/LocalSignInForm.tsx
 * @lld-synced     v0.5
 * @hf             LGN-01
 * @status         built
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ApiError } from '@/lib/errors';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useSignIn } from '../../hooks/useSignIn';
import { readEmployeeCode, rememberEmployeeCode } from '../../utils/rememberChoices';
import { signInSchema } from '../../schemas/signInSchema';

const formSchema = signInSchema.extend({ remember: z.boolean() });
type Values = z.infer<typeof formSchema>;

/** Field message line of the design: icon and words under the field. */
function FieldError({ text }: { text?: string }) {
  return (
    <span className={hf('err')}>
      <span>
        <HfIcon name="alertC" />
      </span>
      <span>{text}</span>
    </span>
  );
}

/**
 * LocalSignInForm.
 *
 * In plain words: the employee code and password form of the high-fidelity design: code in the mono field with the hint, password with Show inside the field and Forgot password beside the label, Caps Lock hint, "Remember my employee code on this device", and the outlined "Sign in with employee code" button.
 *
 * @ac AC-US-LGN01-005-02
 */
export function LocalSignInForm(props: { onError: (e: ApiError) => void; onAttempt?: () => void; failed?: boolean }) {
  const signIn = useSignIn();
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const { register, handleSubmit, resetField, setValue, formState: { errors } } = useForm<Values>({ resolver: zodResolver(formSchema), defaultValues: { employeeCode: '', password: '', remember: false } });
  useEffect(() => {
    const saved = readEmployeeCode();
    if (saved) {
      setValue('employeeCode', saved);
      setValue('remember', true);
    }
  }, [setValue]);
  const submit = handleSubmit((values) => {
    props.onAttempt?.();
    rememberEmployeeCode(values.remember ? values.employeeCode : null);
    signIn.mutate({ employeeCode: values.employeeCode, password: values.password }, {
      onError: (error) => {
        resetField('password');
        props.onError(error);
      },
    });
  });
  const password = register('password');
  return (
    <form onSubmit={submit} noValidate data-testid="local-sign-in-form" aria-label="Sign in with your AMS password">
      <div className={hf('field', errors.employeeCode && 'invalid')}>
        <label htmlFor="code">
          Employee code<span className={hf('req')}>*</span>
        </label>
        <input id="code" className={hf('input mono')} inputMode="numeric" maxLength={5} autoComplete="username" placeholder="5-digit code, e.g. 10002" data-testid="employee-code" {...register('employeeCode')} />
        <FieldError text={errors.employeeCode?.message} />
      </div>
      <div className={hf('field', (errors.password || props.failed) && 'invalid')}>
        <div className={hf('row-sb')}>
          <label htmlFor="pw">
            Password<span className={hf('req')}>*</span>
          </label>
          <a href="/forgot-password" style={{ fontSize: 'var(--fs-2)' }}>
            Forgot password?
          </a>
        </div>
        <div className={hf('pw')}>
          <input
            id="pw"
            className={hf('input')}
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            data-testid="password"
            {...password}
            onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)}
          />
          <button className={hf('eye')} type="button" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onClick={() => setShow(!show)} data-testid="show-password">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        {caps && (
          <span className={hf('help')}>
            <span>
              <HfIcon name="alert" />
            </span>
            Caps Lock is on.
          </span>
        )}
        <FieldError text={errors.password?.message ?? (props.failed ? 'Check the password. It is case-sensitive.' : undefined)} />
      </div>
      <label className={hf('check')}>
        <input type="checkbox" data-testid="remember" {...register('remember')} /> Remember my employee code on this device
      </label>
      <button className={hf('btn btn-outline')} type="submit" disabled={signIn.isPending} data-testid="sign-in-submit">
        {signIn.isPending ? (
          <>
            <span className={hf('spinner')} style={{ width: 18, height: 18, borderWidth: 3, margin: 0 }} /> Signing in…
          </>
        ) : (
          'Sign in with employee code'
        )}
      </button>
    </form>
  );
}
