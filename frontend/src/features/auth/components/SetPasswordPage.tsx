'use client';

/**
 * @file    SetPasswordPage.tsx
 * @module  Auth
 *
 * @description
 * The new password page. In plain words: checks the link, shows the form with the live rules and the strength bar, and saves.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007
 * @subtask        ST-LGN02-007-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/SetPasswordPage.tsx
 * @lld-synced     v0.3
 * @status         built
 */

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type { ApiError } from '@/lib/errors';
import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';
import { usePublicConfig } from '../hooks/usePublicConfig';
import { useResetLink, useSetPassword } from '../hooks/usePasswordFlow';
import { newPasswordSchema } from '../schemas/passwordSchema';
import { AuthShell } from './AuthShell';
import { LinkExpiredPage } from './LinkExpiredPage';
import { PasswordChangedPage } from './PasswordChangedPage';
import { PasswordRules } from './PasswordRules';
import { StrengthBar } from './StrengthBar';

interface Values {
  newPassword: string;
  confirm: string;
}

/** One password field of the design: the box with Show inside it. */
function PasswordBox(props: { id: string; testId: string; show: boolean; onToggle: () => void; field: object }) {
  return (
    <div className={hf('pw')}>
      <input id={props.id} className={hf('input')} type={props.show ? 'text' : 'password'} autoComplete="new-password" data-testid={props.testId} {...props.field} />
      <button className={hf('eye')} type="button" aria-label={props.show ? 'Hide password' : 'Show password'} aria-pressed={props.show} onClick={props.onToggle}>
        {props.show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function FieldError(props: { id: string; text?: string }) {
  if (!props.text) return null;
  return (
    <span className={hf('err')} data-testid={props.id}>
      <span>
        <Icon name="alertC" />
      </span>
      <span>{props.text}</span>
    </span>
  );
}

/** Words for a refused save: the server's own message for a reused password, the list of unmet rules for a policy failure. */
function refusedText(error: ApiError | null): string | undefined {
  if (!error || error.status === 410) return undefined;
  if (error.code === 'PASSWORD_REUSED' || error.code === 'PASSWORD_POLICY') return Object.values(error.fields)[0] ?? error.message;
  return 'We could not save the password. Check your connection and try again.';
}

function SetForm(props: { token: string; onDone: () => void; onExpired: () => void }) {
  const save = useSetPassword();
  const [show, setShow] = useState({ np: false, cp: false });
  const { register, handleSubmit, control, formState: { errors, isValid, dirtyFields } } = useForm<Values>({ resolver: zodResolver(newPasswordSchema), mode: 'onChange', defaultValues: { newPassword: '', confirm: '' } });
  const password = useWatch({ control, name: 'newPassword' });
  const submit = handleSubmit((v) => save.mutate({ token: props.token, newPassword: v.newPassword }, { onSuccess: props.onDone, onError: (e) => e.status === 410 && props.onExpired() }));
  const reused = save.error?.code === 'PASSWORD_REUSED';
  return (
    <form onSubmit={submit} noValidate aria-label="Set a new password">
      <div className={hf('field', (reused || save.error) && 'invalid')}>
        <label htmlFor="np">
          New password<span className={hf('req')}>*</span>
        </label>
        <PasswordBox id="np" testId="set-new" show={show.np} onToggle={() => setShow({ ...show, np: !show.np })} field={register('newPassword')} />
        <StrengthBar password={password} />
        <PasswordRules password={password} reused={reused} />
        <FieldError id="set-error" text={refusedText(save.error)} />
      </div>
      <div className={hf('field', errors.confirm && dirtyFields.confirm && 'invalid')}>
        <label htmlFor="cp">
          Confirm new password<span className={hf('req')}>*</span>
        </label>
        <PasswordBox id="cp" testId="set-confirm" show={show.cp} onToggle={() => setShow({ ...show, cp: !show.cp })} field={register('confirm')} />
        <FieldError id="set-error-confirm" text={dirtyFields.confirm ? errors.confirm?.message : undefined} />
      </div>
      <button id="go" className={hf('btn btn-primary')} type="submit" disabled={!isValid || save.isPending} data-testid="set-submit">
        {save.isPending ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}

/**
 * SetPasswordPage.
 *
 * In plain words: LGN-06 and LGN-07
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-02
 * @workflow  UF-02
 * @screen    LGN-06, LGN-07
 * @contract  API-PWD-02, API-PWD-03
 * @ac        AC-US-LGN02-007-01, AC-US-LGN02-007-02, AC-US-LGN02-007-03, AC-US-LGN02-007-04
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.2
 * @status    built
 *
 * @returns nothing
 */
export function SetPasswordPage(props: { token: string }) {
  const { data } = usePublicConfig();
  const link = useResetLink(props.token);
  const [state, setState] = useState<'form' | 'done' | 'expired'>('form');
  const gone = !props.token || state === 'expired' || (link.error as ApiError | null)?.status === 410;
  let body = <div aria-busy="true" data-testid="set-checking" />;
  if (gone) body = <LinkExpiredPage />;
  else if (state === 'done') body = <PasswordChangedPage />;
  else if (link.isError) body = <p data-testid="set-link-failed">We could not check the link. Check your connection and try again.</p>;
  else if (link.isSuccess)
    body = (
      <div data-testid="set-password-page">
        <h1>Set a new password</h1>
        <p className={hf('sub')}>Choose a password you have not used before.</p>
        <SetForm token={props.token} onDone={() => setState('done')} onExpired={() => setState('expired')} />
      </div>
    );
  return <AuthShell helpEmail={data?.helpdesk.email ?? 'it.helpdesk@ipl.example'}>{body}</AuthShell>;
}
