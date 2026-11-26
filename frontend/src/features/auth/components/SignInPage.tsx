'use client';

/**
 * @file    SignInPage.tsx
 * @module  Auth
 *
 * @description
 * Sign-in screen. In plain words: LGN-01 of the high-fidelity design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SignInPage.tsx
 * @lld-synced     v0.5
 * @hf             LGN-01
 * @status         built
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ApiError } from '@/lib/errors';
import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';
import { usePublicConfig } from '../hooks/usePublicConfig';
import { AuthShell } from './AuthShell';
import { LocalSignInForm } from './LocalSignInForm';
import { SignInErrorPanel } from './SignInErrorPanel';
import { SsoButton } from './SsoButton';

const NOTICES: Record<string, { kind: 'info' | 'success'; icon: 'clock' | 'checkC'; title: string; text: string }> = {
  expired: { kind: 'info', icon: 'clock', title: 'Your session ended', text: 'You were signed out after 30 minutes without activity. Sign in again to continue.' },
  signedout: { kind: 'success', icon: 'checkC', title: 'You have signed out', text: 'Sign in again whenever you are ready.' },
  reset: { kind: 'success', icon: 'checkC', title: 'Password changed', text: 'Sign in with your employee code and new password.' },
};

/**
 * SignInPage.
 *
 * In plain words: the sign-in screen of the high-fidelity design (LGN-01): the frame, the title and line, the single sign-on button, "or use your AMS password", the notice or error alert and the password form.
 *
 * @ac AC-US-LGN01-005-01, AC-US-LGN01-005-02, AC-US-LGN01-005-03
 */
export function SignInPage(props: { next?: string }) {
  const { data } = usePublicConfig();
  const [error, setError] = useState<ApiError | undefined>();
  const notice = NOTICES[useSearchParams().get('reason') ?? ''];
  return (
    <AuthShell helpEmail={data?.helpdesk.email ?? 'it.helpdesk@ipl.example'}>
      <div data-testid="sign-in-page">
        {data?.idpMode === 'stub' && (
          <div className={hf('alert warning')} role="status" data-testid="test-banner" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <span>
              <Icon name="alert" />
            </span>
            <div>
              <b>Test sign-in</b>
              Single sign-on uses a test identity provider, not the IPL one.
            </div>
          </div>
        )}
        {notice && (
          <div className={hf('alert', notice.kind)} style={{ marginBottom: 'var(--spacing-xl)' }}>
            <span>
              <Icon name={notice.icon} />
            </span>
            <div>
              <b>{notice.title}</b>
              {notice.text}
            </div>
          </div>
        )}
        <h1>Sign in</h1>
        <p className={hf('sub')}>Use your IPL network account. One sign-in for all IPL companies.</p>
        {(data?.ssoAvailable ?? true) && <SsoButton returnTo={props.next} />}
        <div className={hf('or')}>or use your AMS password</div>
        {error && <SignInErrorPanel error={error} />}
        <LocalSignInForm onError={setError} onAttempt={() => setError(undefined)} failed={error?.status === 401} />
      </div>
    </AuthShell>
  );
}
