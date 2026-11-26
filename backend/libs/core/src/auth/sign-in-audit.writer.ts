/**
 * @file    sign-in-audit.writer.ts
 * @module  AuthCoreModule
 *
 * @description
 * Audit of sign-in. In plain words: writes one audit record for every sign-in attempt with a reference number for a failure.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-001, US-LGN01-002
 * @subtask        ST-LGN01-001-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/sign-in-audit.writer.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { randomInt } from 'node:crypto';
import { SignInAttempt, SignInResultCode } from './sign-in.types';

const REFERENCE_PREFIX: Record<SignInResultCode, string> = {
  SUCCESS: 'OKS',
  INVALID_CREDENTIALS: 'BAD',
  LOCKED: 'LCK',
  INACTIVE: 'INA',
  RATE_LIMITED: 'RAT',
  FAILED: 'FAI',
  NOACCOUNT: 'NOA',
  CANCELLED: 'CAN',
  SESSION_REUSE: 'REU',
};
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * SignInAuditWriter.
 *
 * In plain words: writes the sign-in audit
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-001, US-LGN01-002
   *   workflows: UF-01
   *   ac:        AC-US-LGN01-001-02
   *   lld:       LLD-EPIC-LGN-01 v0.5 section 6.1
 */
@Injectable()
export class SignInAuditWriter {
  constructor(
    private readonly audit: AuditService,
  ) {}

  /**
   * record.
   *
   * In plain words: writes one record and returns the reference
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-001
   * @subtask   ST-LGN01-001-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-001-02
   * @lld       LLD-EPIC-LGN-01 v0.5 §6.1
   * @status    built
   *
   * @dependencies AuditService.recordChange
   *
   * @returns Promise<string>
   */
  async record(attempt: SignInAttempt): Promise<string> {
    const digits = String(randomInt(0, 10000)).padStart(4, '0');
    let tail = '';
    for (let i = 0; i < 4; i++) tail += ALPHABET[randomInt(0, ALPHABET.length)];
    const reference = `${REFERENCE_PREFIX[attempt.result]}-${digits}-${tail}`;
    await this.audit.recordChange({
      actor: attempt.userId ?? 'anonymous',
      entity: attempt.kind === 'SSO' ? 'SsoSignIn' : attempt.kind === 'SESSION' ? 'Session' : 'SignIn',
      entityKey: attempt.employeeCode.slice(0, 64),
      after: { result: attempt.result, kind: attempt.kind, address: attempt.address, reference },
    });
    return reference;
  }
}
