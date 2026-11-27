/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /choose-password route. In plain words: shows the change-temporary-password page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @story          US-LGN02-008
 * @subtask        ST-LGN02-008-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/app/(public)/choose-password/page.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChangeTemporaryPasswordPage } from '@/features/auth/components/ChangeTemporaryPasswordPage';

export const metadata: Metadata = { title: 'Choose your own password' };

/**
 * ChoosePasswordRoute.
 *
 * In plain words: the address `/choose-password`.
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-008
 * @subtask   ST-LGN02-008-FE-02
 * @workflow  UF-02
 * @screen    LGN-08
 * @ac        AC-US-LGN02-008-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.5
 */
export default function ChoosePasswordRoute() {
  return (
    <Suspense fallback={<main id="main-content" aria-busy="true" />}>
      <ChangeTemporaryPasswordPage />
    </Suspense>
  );
}
