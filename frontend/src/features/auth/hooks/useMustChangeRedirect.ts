/**
 * @file    useMustChangeRedirect.ts
 * @module  Auth
 *
 * @description
 * Must-change-password redirect hook. In plain words: registers with the API client the move to the choose-password page for a user who must change the password; the component that mounts it renders nothing.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/MustChangeRedirect.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setMustChangeHandler } from '@/lib/api-client';

/** Registers the redirect with the API client while the component that calls it is mounted (decision S-2). */
export function useMustChangeRedirect(): void {
  const router = useRouter();
  useEffect(() => {
    setMustChangeHandler(() => {
      if (window.location.pathname !== '/choose-password') router.replace('/choose-password');
    });
    return () => setMustChangeHandler(null);
  }, [router]);
}
