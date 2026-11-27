'use client';

/**
 * @file    ChangeTemporaryPasswordPage.tsx
 * @module  Auth
 *
 * @description
 * The temporary password page (LGN-08). In plain words: the user chip with Sign out, the temporary password and a new one twice with the live rules and the strength bar; a wrong temporary password and a refused new password get a plain message.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/ChangeTemporaryPasswordPage.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type { ApiError } from '@/lib/errors';
import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';
import { useChangeTemporaryPassword } from '../hooks/usePasswordFlow';
import { usePublicConfig } from '../hooks/usePublicConfig';
import { changeTemporarySchema } from '../schemas/passwordSchema';
import { AuthShell } from './AuthShell';
import { FieldError, PasswordBox } from './PasswordFields';
import { PasswordRules } from './PasswordRules';
import { StrengthBar } from './StrengthBar';
import { UserChip } from './UserChip';

interface Values {
  temporaryPassword: string;
  newPassword: string;
  confirm: string;
}

/** Plain words for a refused save (decision S-3: the wrong temporary password counts as a failed sign-in, so the attempts left are shown). */
export function refusedText(error: ApiError | null): string | undefined {
  if (!error) return undefined;
  if (error.code === 'INVALID_CREDENTIALS') {
    const left = Number(error.details.attemptsLeft);
    return `This is not the temporary password the IT team sent.${Number.isFinite(left) ? ` ${left} ${left === 1 ? 'attempt' : 'attempts'} left.` : ''}`;
  }
  if (error.code === 'ACCOUNT_LOCKED')
    return 'Too many wrong attempts. The account is locked for 15 minutes; the IT team can unlock it sooner.';
  if (error.status === 422) return Object.values(error.fields)[0] ?? error.message;
  return 'We could not save the password. Check your connection and try again.';
}

function ChangeForm() {
  const save = useChangeTemporaryPassword();
  const [show, setShow] = useState({ tp: false, np: false, cp: false });
  const toggle = (k: 'tp' | 'np' | 'cp') => () => setShow({ ...show, [k]: !show[k] });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(changeTemporarySchema),
    defaultValues: { temporaryPassword: '', newPassword: '', confirm: '' },
  });
  const password = useWatch({ control, name: 'newPassword' });
  const wrong = save.error?.code === 'INVALID_CREDENTIALS' || save.error?.code === 'ACCOUNT_LOCKED';
  const refused = refusedText(save.error);
  return (
    <form
      onSubmit={handleSubmit((v) =>
        save.mutate({ temporaryPassword: v.temporaryPassword, newPassword: v.newPassword }),
      )}
      noValidate
      aria-label="Choose your own password"
    >
      <div className={hf('field', (errors.temporaryPassword || wrong) && 'invalid')}>
        <label htmlFor="tp">
          Temporary password<span className={hf('req')}>*</span>
        </label>
        <PasswordBox
          id="tp"
          testId="choose-temp"
          show={show.tp}
          onToggle={toggle('tp')}
          field={register('temporaryPassword')}
          autoComplete="current-password"
        />
        <span className={hf('help')}>
          <span>
            <Icon name="info" />
          </span>
          The one in the e-mail from the IT team.
        </span>
        <FieldError
          id="choose-error"
          text={errors.temporaryPassword?.message ?? (wrong ? refused : undefined)}
        />
      </div>
      <div className={hf('field', (errors.newPassword || (save.error && !wrong)) && 'invalid')}>
        <label htmlFor="np">
          New password<span className={hf('req')}>*</span>
        </label>
        <PasswordBox
          id="np"
          testId="choose-new"
          show={show.np}
          onToggle={toggle('np')}
          field={register('newPassword')}
        />
        <StrengthBar password={password} />
        <PasswordRules password={password} reused={save.error?.code === 'PASSWORD_REUSED'} />
        <FieldError
          id="choose-error-new"
          text={errors.newPassword?.message ?? (wrong ? undefined : refused)}
        />
      </div>
      <div className={hf('field', errors.confirm && 'invalid')}>
        <label htmlFor="cp">
          Confirm new password<span className={hf('req')}>*</span>
        </label>
        <PasswordBox
          id="cp"
          testId="choose-confirm"
          show={show.cp}
          onToggle={toggle('cp')}
          field={register('confirm')}
        />
        <FieldError id="choose-error-confirm" text={errors.confirm?.message} />
      </div>
      <button
        id="go"
        className={hf('btn btn-primary')}
        type="submit"
        disabled={save.isPending}
        data-testid="choose-submit"
      >
        {save.isPending ? 'Saving…' : 'Save and continue'}
      </button>
    </form>
  );
}

/**
 * ChangeTemporaryPasswordPage.
 *
 * In plain words: LGN-08. The page of a user who signed in with a temporary password; the web app sends the user back here whenever an API answer says MUST_CHANGE_PASSWORD (decision S-2).
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-008
 * @subtask   ST-LGN02-008-FE-02
 * @workflow  UF-02
 * @screen    LGN-08
 * @contract  API-PWD-04
 * @ac        AC-US-LGN02-008-01, AC-US-LGN02-008-02, AC-US-LGN02-008-03
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.5
 */
export function ChangeTemporaryPasswordPage() {
  const { data } = usePublicConfig();
  return (
    <AuthShell helpEmail={data?.helpdesk.email ?? 'it.helpdesk@ipl.example'}>
      <div data-testid="choose-page">
        <UserChip />
        <h1>Choose your own password</h1>
        <p className={hf('sub')}>
          Your password was set by the IT team. Before you continue, replace it with one only you
          know.
        </p>
        <ChangeForm />
      </div>
    </AuthShell>
  );
}
