/**
 * @file    one-time-password.service.ts
 * @module  UsersModule
 *
 * @description
 * One-time passwords. In plain words: makes a random one-time password, keeps only its hash, makes the user change it at the first sign-in, and e-mails it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/one-time-password.service.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { TemporaryPasswordMailer } from '../ports/temporary-password-mailer.port';
import { OneTimePasswordRepository } from '../repositories/one-time-password';
import { UserWriteRepository } from '../repositories/user-write/contract';
import { PasswordHasher } from './password-hasher';

/**
 * One-time password service.
 *
 * In plain words: issues one-time passwords; the password is never logged and never stored in clear.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-02, API-USR-07, API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.24 section 6.1
 */
/** The letters and digits a one-time password is made of: no 0, O, 1, l or I, so it can be read out and typed. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const LENGTH = 12;

@Injectable()
export class OneTimePasswordService {
  constructor(
    private readonly hasher: PasswordHasher,
    private readonly passwords: OneTimePasswordRepository,
    private readonly writes: UserWriteRepository,
    private readonly mailer: TemporaryPasswordMailer,
  ) {}

  /**
   * Issues a one-time password.
   *
   * In plain words: makes a new random one-time password, stores only its hash (the old one stops working), sets must-change-password, and e-mails it.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-03
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02, API-USR-07, API-USR-08
 * @ac        AC-US007-02, AC-US007-03
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PasswordHasher.hash, OneTimePasswordRepository.replace, UserWriteRepository.setMustChangePassword, TemporaryPasswordMailer.send
   *
   * @param user - id, e-mail and full name
   * @returns `SENT` or `FAILED`; the user stays saved when the e-mail fails (decision L-51)
   */
  async issue(user: { id: string; email: string; fullName: string }): Promise<'SENT' | 'FAILED'> {
    const password = Array.from({ length: LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
    await this.passwords.replace(user.id, await this.hasher.hash(password));
    await this.writes.setMustChangePassword(user.id, true);
    try {
      return await this.mailer.send({ email: user.email, fullName: user.fullName }, password);
    } catch {
      return 'FAILED';
    }
  }
}
