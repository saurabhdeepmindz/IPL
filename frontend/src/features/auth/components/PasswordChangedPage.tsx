/**
 * @file    PasswordChangedPage.tsx
 * @module  Auth
 *
 * @description
 * The password changed page. In plain words: confirms the change, says other devices were signed out and leads to sign-in.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007
 * @subtask        ST-LGN02-007-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/PasswordChangedPage.tsx
 * @lld-synced     v0.3
 * @status         built
 */

import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';

/**
 * PasswordChangedPage.
 *
 * In plain words: LGN-07
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-02
 * @workflow  UF-02
 * @screen    LGN-07
 * @ac        AC-US-LGN02-007-04
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.2
 * @status    built
 *
 * @returns nothing
 */
export function PasswordChangedPage() {
  return (
    <div data-testid="password-changed">
      <span className={hf('big-ic ok')}>
        <Icon name="checkC" />
      </span>
      <h1>Password changed</h1>
      <p className={hf('sub')}>Your new password works from now on. For safety, you have been signed out of AMS on other devices.</p>
      <a className={hf('btn btn-primary')} href="/login?reason=reset" data-testid="password-changed-sign-in">
        Sign in
      </a>
    </div>
  );
}
