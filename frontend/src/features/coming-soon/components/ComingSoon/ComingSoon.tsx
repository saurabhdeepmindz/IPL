/**
 * @file    ComingSoon.tsx
 * @module  ComingSoon
 *
 * @description
 * Coming soon placeholder. In plain words: the page that stands in for a screen of a later release.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             Coming soon (any HF screen of a later release)
 * @status         built
 */

import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';

interface ComingSoonProps {
  /** Name of the screen or feature that is not built yet, as the design names it. */
  feature: string;
  /** Where the user goes back to. Default: the dashboard. */
  backHref?: string;
  /** Text of the back button. Default: "Back to Dashboard". */
  backLabel?: string;
}

/**
 * ComingSoon.
 *
 * In plain words: the placeholder for a screen, a menu item or a button that the design shows but a later release builds. It says so, names the feature and offers a way back. The page is replaced by the real screen when its story is built (the Coming soon register of the release lists each one).
 */
export function ComingSoon({ feature, backHref = '/dashboard', backLabel = 'Back to Dashboard' }: ComingSoonProps) {
  return (
    <section data-testid="coming-soon">
      <div className={hf('page-head')}>
        <div>
          <h1>{feature}</h1>
          <p>This screen is part of a later release.</p>
        </div>
      </div>
      <div className={hf('card')}>
        <div className={hf('empty')}>
          <span className={hf('art')}>
            <HfIcon name="clock" size="lg" />
          </span>
          <b>Coming soon</b>
          <p>{feature} is not available yet. It will be added in an upcoming release. Until then, please continue with the other Administration screens.</p>
          <Link className={hf('btn btn-primary')} href={backHref} data-testid="coming-soon-back">
            <HfIcon name="chevL" />
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
