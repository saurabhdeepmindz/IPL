'use client';

/**
 * @file    SignInErrorPanel.tsx
 * @module  Auth
 *
 * @description
 * Sign-in failures. In plain words: shows wrong credentials with the attempts left, the lock with its end time, an inactive account and the rate-limit wait.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-006
 * @subtask        ST-LGN01-006-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SignInErrorPanel.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { usePublicConfig } from '../hooks/usePublicConfig';
import type { ApiError } from '@/lib/errors';

function Contact({ phone, email, hours }: { phone: string; email: string; hours: string }) {
  return (
    <p className="mb-0 mt-2" data-testid="helpdesk">
      IT helpdesk: {phone}, <a href={`mailto:${email}`}>{email}</a> ({hours}).
    </p>
  );
}

/**
 * SignInErrorPanel.
 *
 * In plain words: LGN-03
 *
 * @epic      EPIC-LGN-01
 * @story     US-LGN01-006
 * @subtask   ST-LGN01-006-FE-02
 * @workflow  UF-01
 * @screen    LGN-03
 * @contract  API-AUTH-01, API-AUTH-05
 * @ac        AC-US-LGN01-006-01, AC-US-LGN01-006-02, AC-US-LGN01-006-03, AC-US-LGN01-006-04
 * @lld       LLD-EPIC-LGN-01 v0.4 §6.4
 * @status    built
 *
 * @returns nothing
 */
export function SignInErrorPanel(props: { error: ApiError }) {
  const { data } = usePublicConfig();
  const { error } = props;
  const d = error.details as { attemptsLeft?: number; lockedUntil?: string; reference?: string; retryAfterSeconds?: number };
  let text: string;
  let showContact = false;
  if (error.status === 401) {
    const n = d.attemptsLeft;
    text = 'Employee code or password is not right.' + (typeof n === 'number' ? ` ${n} ${n === 1 ? 'attempt' : 'attempts'} left before the account is locked.` : '');
  } else if (error.status === 423) {
    const at = d.lockedUntil ? new Date(d.lockedUntil).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'later';
    text = `This account is locked for 15 minutes. It opens again at ${at}. The IT team can unlock it sooner.`;
    showContact = true;
  } else if (error.status === 403) {
    text = 'This account is not active. Please contact the IT helpdesk and quote the reference.';
    showContact = true;
  } else if (error.status === 429) {
    text = `Too many attempts. Wait ${d.retryAfterSeconds ?? 60} seconds and try again.`;
  } else {
    text = error.status === 0 ? error.message : 'Sign-in did not work. Please try again.';
  }
  return (
    <div role="alert" className="alert alert-danger mt-3" data-testid="sign-in-error">
      <span aria-hidden="true" data-testid="error-icon" className="me-2">
        ⚠
      </span>
      <strong className="visually-hidden">Error: </strong>
      {text}
      {d.reference && (
        <p className="mb-0 mt-2" data-testid="reference">
          Reference: {d.reference}
        </p>
      )}
      {showContact && data && <Contact {...data.helpdesk} />}
    </div>
  );
}
