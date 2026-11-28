/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /landing/opening route. In plain words: renders the "Opening your dashboard" page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-005
 * @subtask        ST-LGN03-005-FE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1 (see section 6.4)
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/app/landing/opening/page.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import type { Metadata } from 'next';
import { LandingGate } from '@/features/auth/components/LandingGate';

export const metadata: Metadata = { title: 'Opening your dashboard' };

/**
 * LandingOpeningRoute.
 *
 * In plain words: the address `/landing/opening`.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-005
 * @subtask   ST-LGN03-005-FE-02
 * @workflow  UF-03
 * @screen    LGN-11
 * @ac        AC-US-LGN03-005-03
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @returns The Opening page
 */
export default function LandingOpeningRoute() {
  return <LandingGate />;
}
