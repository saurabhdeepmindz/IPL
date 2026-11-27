/**
 * @file    passwordSchema.ts
 * @module  Auth
 *
 * @description
 * Password rules in the browser. In plain words: the five rules as a list and a Zod schema, the same rules as the server for comfort.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007, US-LGN02-008, US-LGN02-006
 * @subtask        ST-LGN02-007-FE-01
 * @lld            LLD-EPIC-LGN-02 v0.2 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/schemas/passwordSchema.ts
 * @lld-synced     v0.2
 * @status         built
 */

import { z } from 'zod';

/**
 * evaluateRules.
 *
 * In plain words: tests the five rules
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-01
 * @workflow  UF-02
 * @ac        AC-US-LGN02-007-01
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    built
 *
 * @returns { id: string; label: string; met: boolean }[]
 */
export function evaluateRules(password: string): { id: string; label: string; met: boolean }[] {
  return [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'An upper-case letter (A–Z)', met: /[A-Z]/.test(password) },
    { id: 'lower', label: 'A lower-case letter (a–z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'A number (0–9)', met: /\d/.test(password) },
    { id: 'symbol', label: 'A symbol, for example @ # $ %', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

/**
 * newPasswordSchema.
 *
 * In plain words: the set-password form is valid only when all five rules are met and the two fields are equal. The "not one of your last 3" rule is judged by the server.
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-01
 * @ac        AC-US-LGN02-007-01
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.2
 * @status    built
 */
export const newPasswordSchema = z
  .object({ newPassword: z.string().max(128), confirm: z.string().max(128) })
  .superRefine((v, ctx) => {
    const unmet = evaluateRules(v.newPassword).filter((r) => !r.met);
    if (unmet.length) ctx.addIssue({ code: 'custom', path: ['newPassword'], message: `The password does not meet: ${unmet.map((r) => r.label.toLowerCase()).join('; ')}.` });
    if (v.confirm !== v.newPassword) ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'The two passwords do not match.' });
  });

/**
 * changeTemporarySchema.
 *
 * In plain words: the temporary-password form needs the temporary password, a new password that meets the five rules and differs from the temporary one, and the same new password again.
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-008
 * @subtask   ST-LGN02-008-FE-02
 * @ac        AC-US-LGN02-008-02, AC-US-LGN02-008-03
 * @lld       LLD-EPIC-LGN-02 v0.4 §6.5
 * @status    built
 */
export const changeTemporarySchema = z
  .object({ temporaryPassword: z.string().min(1, 'Enter the temporary password from the e-mail').max(128), newPassword: z.string().max(128), confirm: z.string().max(128) })
  .superRefine((v, ctx) => {
    const unmet = evaluateRules(v.newPassword).filter((r) => !r.met);
    if (unmet.length) ctx.addIssue({ code: 'custom', path: ['newPassword'], message: `The password does not meet: ${unmet.map((r) => r.label.toLowerCase()).join('; ')}.` });
    else if (v.newPassword === v.temporaryPassword) ctx.addIssue({ code: 'custom', path: ['newPassword'], message: 'Choose a password different from the temporary one.' });
    if (v.confirm !== v.newPassword) ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'The two passwords do not match.' });
  });
