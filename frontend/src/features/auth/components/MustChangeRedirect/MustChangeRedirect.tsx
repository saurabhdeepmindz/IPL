'use client';

/**
 * @file    MustChangeRedirect.tsx
 * @module  Auth
 *
 * @description
 * Sends a user who must change the password to the change page. In plain words: when any API call answers 403 MUST_CHANGE_PASSWORD, this component moves the user to /choose-password (no page reload, so the token in memory is kept).
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/MustChangeRedirect.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { useMustChangeRedirect } from '../../hooks/useMustChangeRedirect';

/**
 * MustChangeRedirect.
 *
 * In plain words: renders nothing; the hook `useMustChangeRedirect` registers the redirect with the API client (decision S-2).
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-008
 * @subtask   ST-LGN02-008-FE-02
 * @ac        AC-US-LGN02-008-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.5
 */
export function MustChangeRedirect() {
  useMustChangeRedirect();
  return null;
}
