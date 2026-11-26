'use client';

/**
 * @file    SignInPage.tsx
 * @module  Auth
 *
 * @description
 * The sign-in page. In plain words: single sign-on first, the password form below it, a notice about the audit trail and the test banner when the stub is on.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005, US-LGN01-006
 * @subtask        ST-LGN01-005-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SignInPage.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { usePublicConfig } from '../hooks/usePublicConfig';
import { useState } from 'react';
import Link from 'next/link';
import type { ApiError } from '@/lib/errors';
import { LocalSignInForm } from './LocalSignInForm';
import { SignInErrorPanel } from './SignInErrorPanel';
import { SsoButton } from './SsoButton';

/**
 * SignInPage.
 *
 * In plain words: LGN-01
 *
 * @epic      EPIC-LGN-01
 * @story     US-LGN01-005
 * @subtask   ST-LGN01-005-FE-02
 * @workflow  UF-01
 * @screen    LGN-01
 * @contract  API-AUTH-01, API-AUTH-02, API-AUTH-05
 * @ac        AC-US-LGN01-005-01, AC-US-LGN01-005-02, AC-US-LGN01-005-03
 * @lld       LLD-EPIC-LGN-01 v0.4 §6.4
 * @status    built
 *
 * @returns nothing
 */
export function SignInPage(props: { next?: string }) {
  const { data } = usePublicConfig();
  const [error, setError] = useState<ApiError | undefined>();
  return (
    <main id="main-content" className="container py-5" data-testid="sign-in-page">
      <div className="tw:max-w-md mx-auto">
        <h1 className="h3 mb-4">Sign in to AMS</h1>
        {data?.idpMode === 'stub' && (
          <div role="status" className="alert alert-warning" data-testid="test-banner">
            Test sign-in: single sign-on uses a test identity provider, not the IPL one.
          </div>
        )}
        {data?.ssoAvailable && (
          <>
            <SsoButton returnTo={props.next} />
            <p className="text-center my-3 text-body-secondary">or use your AMS password</p>
          </>
        )}
        <LocalSignInForm onError={setError} onAttempt={() => setError(undefined)} />
        {error && <SignInErrorPanel error={error} />}
        <p className="mt-3">
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </main>
  );
}
