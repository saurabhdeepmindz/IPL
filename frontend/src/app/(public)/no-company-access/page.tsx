/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /no-company-access route. In plain words: renders the no-access page.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-004
 * @subtask        ST-LGN03-004-FE-02
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/app/(public)/no-company-access/page.tsx
 * @lld-synced     v0.3
 * @status         built
 */

import type { Metadata } from 'next';
import { NoCompanyAccessPage } from '@/features/auth/components/NoCompanyAccessPage';

export const metadata: Metadata = { title: 'No company access yet' };

/**
 * NoCompanyAccessRoute.
 *
 * In plain words: the address `/no-company-access`.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-004
 * @subtask   ST-LGN03-004-FE-02
 * @workflow  UF-03
 * @screen    LGN-10
 * @ac        AC-US-LGN03-004-01
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @returns The no-access page
 */
export default function NoCompanyAccessRoute() {
  return <NoCompanyAccessPage />;
}
