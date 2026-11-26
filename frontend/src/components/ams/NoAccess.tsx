/**
 * @file    NoAccess.tsx
 * @module  Ams
 *
 * @description
 * The shared no-access message. In plain words: "You do not have access to <screen>." for a 403 on any screen (decision L-115, to be confirmed by the team).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-018
 * @subtask        ST-ADM01-018-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.9
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/components/ams/NoAccess.tsx
 * @lld-synced     v0.30
 * @status         built
 */

import { ApiError } from '@/lib/errors';

/** Props of NoAccess. */
interface NoAccessProps {
  /** The name of the screen, as it reads in the sentence (for example "User Management" or "role details") */
  screen: string;
}

/**
 * No-access message. In plain words: one alert with the same words on every screen; no Retry, because trying again does not help.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-018
 * @subtask   ST-ADM01-018-IN-04
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    ADM-03
 * @ac        AC-US018-01
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.9
 * @status    built
 *
 * @returns The alert
 */
export function NoAccess({ screen }: NoAccessProps) {
  return (
    <p role="alert" data-testid="no-access">
      You do not have access to {screen}.
    </p>
  );
}

/** True when the error is a 403 from the API: the user lacks the right. */
export const isForbidden = (error: unknown): boolean => error instanceof ApiError && error.status === 403;
