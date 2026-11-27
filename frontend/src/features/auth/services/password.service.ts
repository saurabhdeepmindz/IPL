/**
 * @file    password.service.ts
 * @module  Auth
 *
 * @description
 * Calls of the password family. In plain words: one function per contract.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-006, US-LGN02-007, US-LGN02-008
 * @subtask        ST-LGN02-006-FE-01
 * @contract       API-PWD-01, API-PWD-02, API-PWD-03, API-PWD-04
 * @lld            LLD-EPIC-LGN-02 v0.2 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.2.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/src/features/auth/services/password.service.ts
 * @lld-synced     v0.2
 * @status         built
 */

import { toApiError } from '@/lib/errors';
import type { ForgotAnswer, ForgotInput, LinkCheck, SetPasswordInput, TempInput } from '../types/password.types';
import { authHttp } from './auth.service';

/**
 * forgotPassword.
 *
 * In plain words: calls API-PWD-01
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-006
 * @subtask   ST-LGN02-006-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-01
 * @ac        AC-US-LGN02-006-02
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    built
 *
 * @returns Promise<ForgotAnswer>
 */
export async function forgotPassword(input: ForgotInput): Promise<ForgotAnswer> {
  try {
    return (await authHttp.post<{ data: ForgotAnswer }>('/auth/password/forgot', input)).data.data;
  } catch (e) {
    throw toApiError(e);
  }
}

/**
 * checkResetLink.
 *
 * In plain words: calls API-PWD-02
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-02
 * @ac        AC-US-LGN02-007-03
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    pseudo
 *
 * @returns Promise<LinkCheck>
 */
export async function checkResetLink(_token: string): Promise<LinkCheck> {
  // TODO: 1. GET the link check; return the data part.
  throw new Error('Not implemented (pseudo-code)');
}

/**
 * resetPassword.
 *
 * In plain words: calls API-PWD-03
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-007
 * @subtask   ST-LGN02-007-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-03
 * @ac        AC-US-LGN02-007-04
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    pseudo
 *
 * @returns Promise<void>
 */
export async function resetPassword(_input: SetPasswordInput): Promise<void> {
  // TODO: 1. POST the body.
  throw new Error('Not implemented (pseudo-code)');
}

/**
 * changeTemporaryPassword.
 *
 * In plain words: calls API-PWD-04
 *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-008
 * @subtask   ST-LGN02-008-FE-01
 * @workflow  UF-02
 * @contract  API-PWD-04
 * @ac        AC-US-LGN02-008-02
 * @lld       LLD-EPIC-LGN-02 v0.2 §6.2
 * @status    pseudo
 *
 * @returns Promise<{ nextStep: string }>
 */
export async function changeTemporaryPassword(_input: TempInput): Promise<{ nextStep: string }> {
  // TODO: 1. POST the body; return the data part.
  throw new Error('Not implemented (pseudo-code)');
}
