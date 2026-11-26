'use client';

/**
 * @file    SsoStatusPage.tsx
 * @module  Auth
 *
 * @description
 * Single sign-on screens. In plain words: LGN-02 of the high-fidelity design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-007
 * @subtask        ST-LGN01-007-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SsoStatusPage.tsx
 * @lld-synced     v0.5
 * @hf             LGN-02
 * @status         built
 */

import { useEffect, useState } from 'react';
import { hf } from '../hf/hf';
import { Icon, type IconName } from '../hf/Icon';
import { usePublicConfig } from '../hooks/usePublicConfig';
import { ssoStartUrl as startUrl } from '../services/auth.service';
import { AuthShell } from './AuthShell';
import { ContactBlock } from './ContactBlock';

/** Time each step stays current before the next one starts (as in the high-fidelity design). */
const STEP_MS = 800;
const STEPS = ['Opening the IPL sign-in page', 'Checking your IPL network account', 'Finding your AMS access'];

/**
 * SsoStatusPage.
 *
 * In plain words: the single sign-on screens of the high-fidelity design (LGN-02): "Signing you in…" with its three steps, "Single sign-on did not work", "You are not set up in AMS yet" and "Sign-in was cancelled", each with the IT contact and the reference. An unknown state is shown as failed.
 *
 * @ac AC-US-LGN01-007-01, AC-US-LGN01-007-02, AC-US-LGN01-007-03, AC-US-LGN01-007-04
 */
export function SsoStatusPage(props: { state: string; reference?: string; who?: string }) {
  const { data } = usePublicConfig();
  const [current, setCurrent] = useState(0);
  // In plain words: the steps tick one after another while we wait; the last one keeps turning until the answer arrives (the answer comes as a new address, so this screen never claims to be finished).
  useEffect(() => {
    if (props.state !== 'waiting') return undefined;
    const timer = setInterval(() => setCurrent((c) => Math.min(c + 1, STEPS.length - 1)), STEP_MS);
    return () => clearInterval(timer);
  }, [props.state]);
  const state = ['waiting', 'failed', 'noaccount', 'cancelled'].includes(props.state) ? props.state : 'failed';
  const contact = data && state !== 'waiting' ? <ContactBlock helpdesk={data.helpdesk} reference={props.reference} /> : null;
  const big = (cls: string, icon: IconName) => (
    <span className={hf('big-ic', cls)}>
      <Icon name={icon} />
    </span>
  );
  return (
    <AuthShell helpEmail={data?.helpdesk.email ?? 'it.helpdesk@ipl.example'}>
      <div data-testid="sso-status">
        {state === 'waiting' && (
          <div>
            <div className={hf('spinner')} aria-hidden="true" />
            <h1>Signing you in…</h1>
            <p className={hf('sub')}>Please wait. Do not close this window.</p>
            <ul className={hf('steps-v')}>
              {STEPS.map((s, i) => (
                <li key={s} className={i < current ? hf('done') : i === current ? hf('cur') : undefined} data-step-state={i < current ? 'done' : i === current ? 'current' : 'waiting'}>
                  <span className={hf('d')}>{i < current ? '✓' : null}</span>
                  {s}
                </li>
              ))}
            </ul>
            <a className={hf('btn btn-text')} href="/login" style={{ marginTop: 'var(--spacing-xl)' }}>
              Cancel and go back
            </a>
          </div>
        )}
        {state === 'failed' && (
          <div>
            {big('err', 'alertC')}
            <h1>Single sign-on did not work</h1>
            <p className={hf('sub')}>The IPL sign-in service did not answer in time, so we could not confirm who you are. This is usually short-lived.</p>
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <a className={hf('btn btn-primary')} href={startUrl()} data-testid="sso-try-again">
                <Icon name="refresh" />
                Try single sign-on again
              </a>
              <a className={hf('btn btn-outline')} href="/login" data-testid="sso-password-instead">
                Use your AMS password instead
              </a>
            </div>
            {contact}
          </div>
        )}
        {state === 'noaccount' && (
          <div>
            {big('warn', 'user')}
            <h1>You are not set up in AMS yet</h1>
            <p className={hf('sub')}>IPL single sign-on confirmed you{props.who && (<> as <b>{props.who}</b></>)}, but there is no AMS user for this account. The IT team adds users and gives them access.</p>
            <a className={hf('btn btn-outline')} href="/login" data-testid="sso-close">
              Close
            </a>
            {contact}
          </div>
        )}
        {state === 'cancelled' && (
          <div>
            {big('err', 'ban')}
            <h1>Sign-in was cancelled</h1>
            <p className={hf('sub')}>The IPL sign-in page was closed or access was refused, so you are not signed in to AMS.</p>
            <a className={hf('btn btn-primary')} href={startUrl()} data-testid="sso-try-again">
              Try again
            </a>
            {contact}
          </div>
        )}
      </div>
    </AuthShell>
  );
}
