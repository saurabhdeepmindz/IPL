'use client';

/**
 * @file    SsoButton.tsx
 * @module  Auth
 *
 * @description
 * The single sign-on button. In plain words: the one primary button of the sign-in page.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SsoButton.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { ssoStartUrl } from '../services/auth.service';

/**
 * SsoButton.
 *
 * In plain words: single sign-on button
 *
 * @epic      EPIC-LGN-01
 * @story     US-LGN01-005
 * @subtask   ST-LGN01-005-FE-02
 * @workflow  UF-01
 * @screen    LGN-01
 * @contract  API-AUTH-02
 * @ac        AC-US-LGN01-005-01
 * @lld       LLD-EPIC-LGN-01 v0.4 §6.4
 * @status    built
 *
 * @returns nothing
 */
export function SsoButton(props: { returnTo?: string }) {
  return (
    <a className="btn btn-primary btn-lg w-100" href={ssoStartUrl(props.returnTo)} data-testid="sso-button">
      Sign in with IPL single sign-on
    </a>
  );
}
