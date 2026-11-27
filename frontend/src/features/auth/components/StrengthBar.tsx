'use client';

/**
 * @file    StrengthBar.tsx
 * @module  Auth
 *
 * @description
 * The strength bar. In plain words: a bar that moves with the number of rules met.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007, US-LGN02-008
 * @subtask        ST-LGN02-007-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/StrengthBar.tsx
 * @lld-synced     v0.3
 * @status         built
 */

import { hf } from '../hf/hf';
import { evaluateRules } from '../schemas/passwordSchema';

const LABELS = ['Too short', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

/**
 * StrengthBar.
 *
 * In plain words: strength bar
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-02
 * @workflow  UF-02
 * @screen    LGN-06
 * @ac        AC-US-LGN02-007-01
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.2
 * @status    built
 *
 * @returns nothing
 */
export function StrengthBar(props: { password: string }) {
  const rules = evaluateRules(props.password);
  const met = rules.filter((r) => r.met).length;
  const colour = met < 4 ? 'var(--danger-default)' : met < rules.length ? 'var(--secondary-400)' : 'var(--success-default)';
  return (
    <div className={hf('meter')} data-testid="strength-bar" data-met={met}>
      <i style={{ width: `${(met / rules.length) * 100}%`, background: colour }} />
      <span className={hf('sr-only')} data-testid="strength-label">
        Password strength: {LABELS[met]}
      </span>
    </div>
  );
}
