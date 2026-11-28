'use client';

/**
 * @file    PasswordRules.tsx
 * @module  Auth
 *
 * @description
 * The live rules list. In plain words: shows the five rules as met or not met while the user types.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007, US-LGN02-008
 * @subtask        ST-LGN02-007-FE-02
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/components/PasswordRules.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import { hf } from '@/hf/hf';
import { evaluateRules } from '../../schemas/passwordSchema';

/**
 * PasswordRules.
 *
 * In plain words: rules list
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-02
 * @workflow  UF-02
 * @screen    LGN-06
 * @ac        AC-US-LGN02-007-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.2
 * @status    built
 *
 * @returns nothing
 */
export function PasswordRules(props: { password: string; reused?: boolean }) {
  const typed = props.password.length > 0;
  return (
    <ul className={hf('rules')} id="rl" aria-live="polite" data-testid="password-rules">
      {evaluateRules(props.password).map((rule) => (
        <li key={rule.id} className={hf(rule.met ? 'ok' : typed && 'bad')} data-testid={`rule-${rule.id}`} data-met={rule.met}>
          {rule.label}
        </li>
      ))}
      <li className={hf(props.reused && 'bad')} data-testid="rule-history" data-met={!props.reused}>
        Not one of your last 3 passwords
      </li>
    </ul>
  );
}
