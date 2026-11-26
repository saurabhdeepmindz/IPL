/**
 * @file    sign-in-response.transformer.ts
 * @module  AuthModule
 *
 * @description
 * Shapes the sign-in answer. In plain words: turns the sign-in result into the body of API-AUTH-01 and never includes a hash.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001
 * @subtask        ST-LGN01-001-BE-01
 * @contract       API-AUTH-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/apps/auth-apis/src/transformer/sign-in-response.transformer.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import type { SignInResult } from '@libs/core';

export interface SignInResponse {
  nextStep: 'CHANGE_PASSWORD' | 'CHOOSE_WORK';
  user: { employeeCode: string; name: string };
  accessToken: string;
  expiresIn: number;
}

/**
 * SignInResponseTransformer.
 *
 * In plain words: builds the body of API-AUTH-01 and leaves out the refresh token (it goes in the cookie) and every secret.
 */
@Injectable()
export class SignInResponseTransformer {
  /** @ac AC-US-LGN01-001-01 */
  toBody(result: SignInResult): SignInResponse {
    return { nextStep: result.nextStep, user: { employeeCode: result.user.employeeCode, name: result.user.name }, accessToken: result.accessToken, expiresIn: result.expiresIn };
  }
}
