/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /choose-work route. In plain words: renders the company page. The sign-in and the change of a temporary password already send the user here.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003
 * @subtask        ST-LGN03-003-FE-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/app/(public)/choose-work/page.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import type { Metadata } from 'next';
import { ChooseCompanyPage } from '@/features/auth/components/ChooseCompanyPage';

export const metadata: Metadata = { title: 'Choose where to work' };

/**
 * ChooseWorkRoute.
 *
 * In plain words: the address `/choose-work`.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-003
 * @subtask   ST-LGN03-003-FE-02
 * @workflow  UF-03
 * @screen    LGN-09
 * @ac        AC-US-LGN03-003-01
 * @lld       LLD-EPIC-LGN-03 v0.4 §6.1
 * @status    built
 *
 * @returns The company page
 */
export default function ChooseWorkRoute() {
  return <ChooseCompanyPage />;
}
