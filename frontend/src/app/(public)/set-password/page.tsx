/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /set-password route. In plain words: renders the new password page with the token from the address.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007
 * @subtask        ST-LGN02-007-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/app/(public)/set-password/page.tsx
 * @lld-synced     v0.3
 * @status         built
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SetPasswordPage } from '@/features/auth/components/SetPasswordPage';

export const metadata: Metadata = { title: 'Set a new password' };
type SetSearch = Promise<{ token?: string }>;

/**
 * SetPasswordRoute.
 *
 * In plain words: route
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-02
 * @workflow  UF-02
 * @screen    LGN-06
 * @ac        AC-US-LGN02-007-03
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.2
 * @status    built
 *
 * @returns nothing
 */
export default function SetPasswordRoute(props: { searchParams: SetSearch }) {
  return (
    <Suspense fallback={<main id="main-content" aria-busy="true" />}>
      <SetPasswordContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SetPasswordContent(props: { searchParams: SetSearch }) {
  const { token } = await props.searchParams;
  return <SetPasswordPage token={token ?? ''} />;
}
