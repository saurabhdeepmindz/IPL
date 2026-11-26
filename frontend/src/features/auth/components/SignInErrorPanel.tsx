'use client';

/**
 * @file    SignInErrorPanel.tsx
 * @module  Auth
 *
 * @description
 * Sign-in failure alert. In plain words: wrong password, locked and inactive alerts in the words of the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-006
 * @subtask        ST-LGN01-006-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SignInErrorPanel.tsx
 * @lld-synced     v0.5
 * @hf             LGN-01 (states error, locked, inactive)
 * @status         built
 */

import type { ReactNode } from 'react';
import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';
import { usePublicConfig } from '../hooks/usePublicConfig';
import type { ApiError } from '@/lib/errors';
import { ContactBlock } from './ContactBlock';

type Details = { attemptsLeft?: number; lockedUntil?: string; reference?: string; retryAfterSeconds?: number };

/** Time as HH:MM on a 24-hour clock, as the design shows it. */
function clock(iso?: string): string {
  const d = iso ? new Date(iso) : new Date(Date.now() + 15 * 60_000);
  return d.toTimeString().slice(0, 5);
}

/**
 * SignInErrorPanel.
 *
 * In plain words: the alert above the password form (high-fidelity LGN-01 states "Wrong password", "Locked" and "Inactive"). It uses the words of the design, an icon and a title, never colour alone.
 *
 * @ac AC-US-LGN01-006-01, AC-US-LGN01-006-02, AC-US-LGN01-006-04
 */
export function SignInErrorPanel(props: { error: ApiError }) {
  const { data } = usePublicConfig();
  const { error } = props;
  const d = error.details as Details;
  let kind = 'danger';
  let title = 'We could not sign you in';
  let body: ReactNode;
  let contact = false;
  if (error.status === 401) {
    const n = d.attemptsLeft;
    body = (
      <>
        The employee code or password is not correct.
        {typeof n === 'number' && (
          <>
            {' '}
            <b>
              {n} {n === 1 ? 'attempt' : 'attempts'} left
            </b>{' '}
            before the account is locked for 15 minutes.
          </>
        )}
      </>
    );
  } else if (error.status === 423) {
    kind = 'warning';
    title = 'Your account is locked';
    contact = true;
    body = (
      <>
        After 5 sign-in attempts that did not work, this account is locked for 15 minutes, until <b>{clock(d.lockedUntil)}</b>. The IT team can unlock it sooner.
      </>
    );
  } else if (error.status === 403) {
    title = 'Your AMS account is inactive';
    contact = true;
    body = <>Your access was ended by the IT team. If you need AMS again, contact them.</>;
  } else if (error.status === 429) {
    title = 'Too many attempts';
    body = <>Wait {d.retryAfterSeconds ?? 60} seconds and try again.</>;
  } else {
    body = <>{error.status === 0 ? error.message : 'Sign-in did not work. Please try again.'}</>;
  }
  return (
    <div className={hf('alert', kind)} role="alert" data-testid="sign-in-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
      <span data-testid="error-icon">
        <Icon name="alertC" />
      </span>
      <div>
        <b>{title}</b>
        <span>{body}</span>
        {contact && data && <ContactBlock helpdesk={data.helpdesk} reference={d.reference} />}
      </div>
    </div>
  );
}
