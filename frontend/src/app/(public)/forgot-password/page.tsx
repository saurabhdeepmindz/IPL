/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /forgot-password route. In plain words: renders the reset request page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-006
 * @subtask        ST-LGN02-006-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/app/(public)/forgot-password/page.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordPage } from '@/features/auth/components/ForgotPasswordPage';

export const metadata: Metadata = { title: 'Reset your password' };

/**
 * ForgotPasswordRoute.
 *
 * In plain words: the address `/forgot-password`; it shows the reset request page.
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-006
 * @subtask   ST-LGN02-006-FE-02
 * @workflow  UF-02
 * @screen    LGN-04
 * @ac        AC-US-LGN02-006-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.2
 */
export default function ForgotPasswordRoute() {
  return (
    <Suspense fallback={<main id="main-content" aria-busy="true" />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
