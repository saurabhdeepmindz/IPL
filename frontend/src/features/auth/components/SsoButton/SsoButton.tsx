/**
 * @file    SsoButton.tsx
 * @module  Auth
 *
 * @description
 * Single sign-on button. In plain words: the primary link with its icon and the line under it.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/SsoButton.tsx
 * @lld-synced     v0.5
 * @hf             LGN-01
 * @status         built
 */

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { ssoStartUrl } from '../../services/auth.service';

/**
 * SsoButton.
 *
 * In plain words: the primary "Sign in with IPL single sign-on" button with its icon and the line under it (high-fidelity LGN-01). It is a link, so the whole page visit works without script.
 */
export function SsoButton(props: { returnTo?: string }) {
  return (
    <>
      <a className={hf('btn btn-primary')} href={ssoStartUrl(props.returnTo)} data-testid="sso-button">
        <HfIcon name="sso" />
        Sign in with IPL single sign-on
      </a>
      <p className={hf('muted')} style={{ fontSize: 'var(--fs-1)', margin: 'var(--spacing-sm) 0 0', textAlign: 'center' }}>
        You will be taken to the IPL sign-in page and brought back here.
      </p>
    </>
  );
}
