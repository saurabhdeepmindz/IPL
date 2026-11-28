'use client';

/**
 * @file    UserChip.tsx
 * @module  Auth
 *
 * @description
 * The user chip of the change-password page. In plain words: a round icon, the employee code, the words "Employee code" and a Sign out link that ends the session in the browser and goes to the sign-in page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/UserChip.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { useSessionStore } from '@/store/session.store';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { useSignOut } from '../../hooks/useSignOut';

/** The user chip: the sign-in answer gives the employee code, not the name (decision UX-LGN-04). */
export function UserChip() {
  const code = useSessionStore((s) => s.user?.employeeCode) ?? '';
  const signOut = useSignOut();
  return (
    <div className={hf('who')} data-testid="choose-chip">
      <span className={hf('avatar')} id="av">
        <HfIcon name="user" />
      </span>
      <div>
        <b id="wn">{code}</b>
        <small id="wd">Employee code</small>
      </div>
      <a
        href="/login?reason=signedout"
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
        data-testid="choose-sign-out"
      >
        Sign out
      </a>
    </div>
  );
}
