'use client';

/**
 * @file    SsoStatusPage.tsx
 * @module  Auth
 *
 * @description
 * Single sign-on states. In plain words: the waiting state and the did-not-work, no-account and cancelled pages with the helpdesk contact and the reference.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-007
 * @subtask        ST-LGN01-007-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SsoStatusPage.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { usePublicConfig } from '../hooks/usePublicConfig';
import { ssoStartUrl as startUrl } from '../services/auth.service';

/**
 * SsoStatusPage.
 *
 * In plain words: LGN-02
 *
 * @epic      EPIC-LGN-01
 * @story     US-LGN01-007
 * @subtask   ST-LGN01-007-FE-02
 * @workflow  UF-01
 * @screen    LGN-02
 * @contract  API-AUTH-02, API-AUTH-03, API-AUTH-05
 * @ac        AC-US-LGN01-007-01, AC-US-LGN01-007-02, AC-US-LGN01-007-03, AC-US-LGN01-007-04
 * @lld       LLD-EPIC-LGN-01 v0.4 §6.4
 * @status    built
 *
 * @returns nothing
 */
export function SsoStatusPage(props: { state: string; reference?: string }) {
  const { data } = usePublicConfig();
  const known = ['waiting', 'failed', 'noaccount', 'cancelled'];
  const state = known.includes(props.state) ? props.state : 'failed';
  const text: Record<string, string> = {
    waiting: 'Signing you in with IPL single sign-on. Please wait.',
    failed: 'Single sign-on did not work. The identity provider could not be reached or did not answer.',
    noaccount: 'You are signed in at IPL, but you are not set up in AMS yet. Please ask the IT team to add you.',
    cancelled: 'Single sign-on was cancelled. No change was made.',
  };
  return (
    <main id="main-content" className="container py-5" data-testid="sso-status">
      <h1 className="h3">Single sign-on</h1>
      <p role={state === 'waiting' ? 'status' : 'alert'}>
        <span aria-hidden="true" className="me-2">
          {state === 'waiting' ? '⏳' : '⚠'}
        </span>
        {text[state]}
      </p>
      {state === 'waiting' && <div className="spinner-border" role="presentation" />}
      <div className="d-flex gap-2 flex-wrap my-3">
        {(state === 'failed' || state === 'cancelled') && (
          <a className="btn btn-primary" href={startUrl()} data-testid="sso-try-again">
            Try again
          </a>
        )}
        {state === 'failed' && (
          <a className="btn btn-outline-primary" href="/login" data-testid="sso-password-instead">
            Use your AMS password instead
          </a>
        )}
        {state === 'noaccount' && (
          <a className="btn btn-primary" href="/login" data-testid="sso-close">
            Close
          </a>
        )}
        {state === 'waiting' && <a href="/login">Back to sign-in</a>}
      </div>
      {props.reference && (
        <p data-testid="reference">Reference: {props.reference}</p>
      )}
      {state !== 'waiting' && data && (
        <p data-testid="helpdesk">
          IT helpdesk: {data.helpdesk.phone}, <a href={`mailto:${data.helpdesk.email}`}>{data.helpdesk.email}</a> ({data.helpdesk.hours}).
        </p>
      )}
    </main>
  );
}
