/**
 * @file    ContactBlock.tsx
 * @module  Auth
 *
 * @description
 * IT contact box. In plain words: the Contact the IT team box of the design, with the reference to quote.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-006
 * @subtask        ST-LGN01-006-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/ContactBlock.tsx
 * @lld-synced     v0.5
 * @hf             LGN-01, LGN-02
 * @status         built
 */

import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { PublicConfig } from '../../types/auth.types';

/**
 * ContactBlock.
 *
 * In plain words: the "Contact the IT team" box of the high-fidelity design: phone and e-mail (each with a Placeholder badge while the values are placeholders), the hours, and the reference to quote.
 */
export function ContactBlock({ helpdesk, reference }: { helpdesk: PublicConfig['helpdesk']; reference?: string }) {
  const placeholder = helpdesk.placeholder ? <span className={hf('badge b-warning plain phb')}>Placeholder</span> : null;
  return (
    <div className={hf('contact')} data-testid="helpdesk">
      <b>Contact the IT team</b>
      <span>
        <HfIcon name="info" size="sm" /> Phone: {helpdesk.phone} {placeholder}
      </span>
      <span>
        <HfIcon name="mail" size="sm" /> E-mail: <a href={`mailto:${helpdesk.email}`}>{helpdesk.email}</a> {placeholder}
      </span>
      <span className={hf('muted')}>
        {helpdesk.hours}
        {reference && (
          <>
            {' '}
            · Quote reference <b className={hf('mono')} data-testid="reference">{reference}</b>
          </>
        )}
      </span>
    </div>
  );
}
