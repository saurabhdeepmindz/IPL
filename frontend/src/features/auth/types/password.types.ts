/**
 * @file    password.types.ts
 * @module  Auth
 *
 * @description
 * Types of the password screens. In plain words: shapes of the answers of API-PWD-01 to 04.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-006, US-LGN02-007, US-LGN02-008
 * @subtask        ST-LGN02-006-FE-01
 * @lld            LLD-EPIC-LGN-02 v0.2 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/types/password.types.ts
 * @lld-synced     v0.2
 * @status         built
 */

/**
 * password.types.
 *
 * In plain words: types
 *
 * @rtm
   *   epics:     EPIC-LGN-02
   *   stories:   US-LGN02-006, US-LGN02-007, US-LGN02-008
   *   workflows: UF-02
   *   ac:        AC-US-LGN02-006-02
   *   lld:       LLD-EPIC-LGN-02 v0.2 section 6.2
 */
export interface ForgotAnswer { message: string; retryAfterSeconds: number }
export interface LinkCheck { valid: true; maskedEmail: string }
export interface ForgotInput { employeeCode: string; email: string }
export interface SetPasswordInput { token: string; newPassword: string }
export interface TempInput { temporaryPassword: string; newPassword: string }
