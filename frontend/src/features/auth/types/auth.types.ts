/**
 * @file    auth.types.ts
 * @module  Auth
 *
 * @description
 * Types of the sign-in screens. In plain words: shapes of the answers of API-AUTH-01 to 05 and the failure states.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005, US-LGN01-006, US-LGN01-007
 * @subtask        ST-LGN01-005-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/types/auth.types.ts
 * @lld-synced     v0.4
 * @status         pseudo
 */

/**
 * auth.types.
 *
 * In plain words: types
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-005, US-LGN01-006, US-LGN01-007
   *   workflows: UF-01
   *   ac:        AC-US-LGN01-005-02
   *   lld:       LLD-EPIC-LGN-01 v0.4 section 6.4
 */
export type NextStep = 'CHOOSE_WORK' | 'CHANGE_PASSWORD';
export interface SignInResponse { nextStep: NextStep; user: { employeeCode: string; name: string }; accessToken: string; expiresIn: number }
export interface PublicConfig { ssoAvailable: boolean; idpMode?: 'stub' | 'saml' | 'oidc'; helpdesk: { phone: string; email: string; hours: string; placeholder: boolean } }
export type SsoFailure = 'failed' | 'noaccount' | 'cancelled';
