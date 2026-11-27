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
 * @lld            LLD-EPIC-LGN-02 v0.4 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.4.md
 * @lld-synced     v0.4
 * @status         built
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setMustChangeHandler } from '@/lib/api-client';

/**
 * MustChangeRedirect.
 *
 * In plain words: renders nothing; it registers the redirect with the API client (decision S-2).
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-008
 * @subtask   ST-LGN02-008-FE-02
 * @ac        AC-US-LGN02-008-01
 * @lld       LLD-EPIC-LGN-02 v0.4 §6.5
 */
export function MustChangeRedirect() {
  const router = useRouter();
  useEffect(() => {
    setMustChangeHandler(() => {
      if (window.location.pathname !== '/choose-password') router.replace('/choose-password');
    });
    return () => setMustChangeHandler(null);
  }, [router]);
  return null;
}
