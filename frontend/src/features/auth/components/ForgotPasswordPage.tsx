'use client';

/**
 * @file    ForgotPasswordPage.tsx
 * @module  Auth
 *
 * @description
 * The reset request page. In plain words: employee code and official e-mail, a note for SSO users, and the check-your-e-mail view with a resend countdown.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-006
 * @subtask        ST-LGN02-006-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/ForgotPasswordPage.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ApiError } from '@/lib/errors';
import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';
import { usePublicConfig } from '../hooks/usePublicConfig';
import { useForgotPassword } from '../hooks/usePasswordFlow';
import { AuthShell } from './AuthShell';

const schema = z.object({
  employeeCode: z.string().regex(/^\d{5}$/, 'Enter your 5-digit employee code'),
  email: z.string().min(1, 'Enter your official e-mail').email('Enter a valid e-mail address'),
});
type Values = z.infer<typeof schema>;

/** Shows two characters of the address and hides the rest of the name (decision S-1). */
export function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.trim().split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}

/** Words for a wait: "2 minutes" or "40 seconds". */
export function waitText(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
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

function ProblemNote(props: { error: ApiError }) {
  const limited = props.error.status === 429;
  const seconds = Number(props.error.details.retryAfterSeconds ?? 60);
  return (
    <div className={hf('alert warning')} role="alert" style={{ marginBottom: 'var(--spacing-lg)' }} data-testid={limited ? 'forgot-wait' : 'forgot-failed'}>
      <span>
        <Icon name="alert" />
      </span>
      <div>{limited ? `Too many requests. Try again in ${waitText(seconds)}.` : 'We could not send the request. Check your connection and try again.'}</div>
    </div>
  );
}

function RequestView(props: { onSent: (values: Values, wait: number) => void }) {
  const send = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { employeeCode: '', email: '' } });
  const submit = handleSubmit((values) => send.mutate(values, { onSuccess: (answer) => props.onSent(values, answer.retryAfterSeconds) }));
  return (
    <div data-testid="forgot-request">
      <a className={hf('btn btn-text sm inline')} href="/login" style={{ paddingLeft: 0, marginBottom: 'var(--spacing-md)' }}>
        <Icon name="chevL" />
        Back to sign in
      </a>
      <h1>Reset your password</h1>
      <p className={hf('sub')}>For AMS password accounts. Enter your employee code and official e-mail; we will send a link to set a new password.</p>
      <div className={hf('alert info')} style={{ marginBottom: 'var(--spacing-lg)' }} data-testid="forgot-sso-note">
        <span>
          <Icon name="info" />
        </span>
        <div>
          If you sign in with <b>IPL single sign-on</b>, your password is your IPL network password — reset it through the IT team.
        </div>
      </div>
      {send.error && <ProblemNote error={send.error} />}
      <form onSubmit={submit} noValidate aria-label="Ask for a reset link">
        <div className={hf('field', errors.employeeCode && 'invalid')}>
          <label htmlFor="code">
            Employee code<span className={hf('req')}>*</span>
          </label>
          <input id="code" className={hf('input mono')} inputMode="numeric" maxLength={5} placeholder="e.g. 10002" data-testid="forgot-code" {...register('employeeCode')} />
          <FieldError id="forgot-error-code" text={errors.employeeCode?.message} />
        </div>
        <div className={hf('field', errors.email && 'invalid')}>
          <label htmlFor="mail">
            Official e-mail<span className={hf('req')}>*</span>
          </label>
          <input id="mail" className={hf('input')} type="email" placeholder="name@ipl.example" data-testid="forgot-email" {...register('email')} />
          <FieldError id="forgot-error-email" text={errors.email?.message} />
        </div>
        <button className={hf('btn btn-primary')} type="submit" disabled={send.isPending} data-testid="forgot-submit">
          {send.isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}

function SentView(props: { values: Values; wait: number; onResend: () => Promise<number> }) {
  const [left, setLeft] = useState(props.wait);
  const [again, setAgain] = useState(false);
  useEffect(() => {
    if (left <= 0) return undefined;
    const timer = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  const resend = async () => {
    setLeft(await props.onResend());
    setAgain(true);
  };
  return (
    <div data-testid="forgot-sent">
      <span className={hf('big-ic')}>
        <Icon name="mail" />
      </span>
      <h1>Check your e-mail</h1>
      <p className={hf('sub')}>
        If the employee code and e-mail match an AMS password account, we have sent a link to{' '}
        <b id="mk" data-testid="forgot-masked">
          {maskEmail(props.values.email)}
        </b>
        . The link works once and expires in <b>30 minutes</b>.
      </p>
      <div className={hf('alert info')} style={{ marginBottom: 'var(--spacing-lg)' }} role="status">
        <span>
          <Icon name="info" />
        </span>
        <div>
          {again ? 'Link sent again. The earlier link no longer works. ' : ''}Not in your inbox? Check junk mail. You can ask for a new link after <b data-testid="forgot-countdown">{left}</b> seconds.
        </div>
      </div>
      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <button className={hf('btn btn-outline')} type="button" disabled={left > 0} onClick={resend} data-testid="forgot-resend">
          Send the link again
        </button>
        <a className={hf('btn btn-text')} href="/login">
          Back to sign in
        </a>
      </div>
    </div>
  );
}

/**
 * ForgotPasswordPage.
 *
 * In plain words: LGN-04 (employee code and official e-mail, note for single sign-on users) and LGN-05 (Check your e-mail with the masked address, the 30-minute note and a resend button that waits for the time the server gives).
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-006
 * @subtask   ST-LGN02-006-FE-02
 * @workflow  UF-02
 * @screen    LGN-04, LGN-05
 * @contract  API-PWD-01
 * @ac        AC-US-LGN02-006-01, AC-US-LGN02-006-02, AC-US-LGN02-006-03, AC-US-LGN02-006-04, AC-US-LGN02-006-05
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.2
 */
export function ForgotPasswordPage() {
  const { data } = usePublicConfig();
  const resend = useForgotPassword();
  const [sent, setSent] = useState<{ values: Values; wait: number } | undefined>();
  return (
    <AuthShell helpEmail={data?.helpdesk.email ?? 'it.helpdesk@ipl.example'}>
      {sent ? (
        <SentView values={sent.values} wait={sent.wait} onResend={async () => (await resend.mutateAsync(sent.values)).retryAfterSeconds} />
      ) : (
        <RequestView onSent={(values, wait) => setSent({ values, wait })} />
      )}
    </AuthShell>
  );
}
