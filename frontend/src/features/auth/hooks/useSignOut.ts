/**
 * @file    useSignOut.ts
 * @module  Auth
 *
 * @description
 * The browser-side sign-out. In plain words: forgets the access token, removes the session marker cookie, clears the session store and every cached answer (so the next user never sees the data of the last one), and opens the sign-in page. The server session is ended by EPIC-LGN-04.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-004
 * @subtask        ST-LGN03-004-FE-02
 * @screen         LGN-09, LGN-10
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1 (see section 6.4)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/hooks/useSignOut.ts
 * @lld-synced     v0.4
 * @status         built
 */
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { clearAccessToken, clearSessionMarker } from '@/lib/token';
import { useSessionStore } from '@/store/session.store';

/**
 * useSignOut.
 *
 * In plain words: returns the function that signs the user out in this browser.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-004
 * @subtask   ST-LGN03-004-FE-02
 * @workflow  UF-03
 * @screen    LGN-09, LGN-10
 * @ac        AC-US-LGN03-004-01
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @returns A function with no arguments
 */
export function useSignOut(): () => void {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    clearAccessToken();
    clearSessionMarker();
    useSessionStore.getState().signOut();
    queryClient.clear();
    router.push('/login?reason=signedout');
  };
}
