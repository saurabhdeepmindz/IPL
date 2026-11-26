/**
 * @file    signInSchema.ts
 * @module  Auth
 *
 * @description
 * Sign-in form rules. In plain words: the Zod rules of the password form (5-digit code, password not empty).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/schemas/signInSchema.ts
 * @lld-synced     v0.5
 * @status         pseudo
 */

import { z } from 'zod';

/**
 * signInSchema.
 *
 * In plain words: Zod schema
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-005
   *   workflows: UF-01
   *   ac:        AC-US-LGN01-005-02
   *   lld:       LLD-EPIC-LGN-01 v0.5 section 6.4
 */
export const signInSchema = z.object({
  employeeCode: z.string().regex(/^\d{5}$/, 'Enter your 5-digit employee code'),
  password: z.string().min(1, 'Enter your password').max(128),
});
