/**
 * @file    sign-in.types.ts
 * @module  AuthCoreModule
 *
 * @description
 * Shapes shared by the sign-in services. In plain words: the next step, the attempt that is audited and the tokens of a session.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/sign-in.types.ts
 * @lld-synced     v0.5
 * @status         built
 */

export type NextStep = 'CHANGE_PASSWORD' | 'CHOOSE_WORK';

/** The result codes written to the audit record of a sign-in attempt. */
export type SignInResultCode = 'SUCCESS' | 'INVALID_CREDENTIALS' | 'LOCKED' | 'INACTIVE' | 'RATE_LIMITED' | 'FAILED' | 'NOACCOUNT' | 'CANCELLED' | 'SESSION_REUSE';

export interface SignInAttempt {
  kind: 'LOCAL' | 'SSO' | 'SESSION';
  /** As typed by the user (never a password). */
  employeeCode: string;
  result: SignInResultCode;
  address?: string;
  userId?: string;
}

export interface SessionUserInput {
  id: string;
  employeeCode: string;
  fullName: string;
  departmentId: string | null;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  refreshSeconds: number;
  expiresIn: number;
}

export interface SignInResult extends SessionTokens {
  nextStep: NextStep;
  user: { employeeCode: string; name: string };
}

export type SsoResult =
  | (SessionTokens & { ok: true; nextStep: NextStep; returnTo?: string })
  | { ok: false; kind: 'failed' | 'noaccount' | 'cancelled'; reference: string; who?: string };
