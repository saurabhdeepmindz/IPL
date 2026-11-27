/**
 * @file    LinkExpiredPage.tsx
 * @module  Auth
 *
 * @description
 * The expired link page. In plain words: says the link has expired and offers a new one.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007
 * @subtask        ST-LGN02-007-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/LinkExpiredPage.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';

/**
 * LinkExpiredPage.
 *
 * In plain words: LGN-06 expired
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-02
 * @workflow  UF-02
 * @screen    LGN-06
 * @ac        AC-US-LGN02-007-03
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.2
 * @status    built
 *
 * @returns nothing
 */
export function LinkExpiredPage() {
  return (
    <div data-testid="link-expired">
      <span className={hf('big-ic warn')}>
        <Icon name="clock" />
      </span>
      <h1>This link has expired</h1>
      <p className={hf('sub')}>Reset links work once and only for 30 minutes. Ask for a new link — it only takes a moment.</p>
      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <a className={hf('btn btn-primary')} href="/forgot-password" data-testid="ask-new-link">
          Ask for a new link
        </a>
        <a className={hf('btn btn-text')} href="/login">
          Back to sign in
        </a>
      </div>
    </div>
  );
}
