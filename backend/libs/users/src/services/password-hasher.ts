/**
 * @file    password-hasher.ts
 * @module  UsersModule
 *
 * @description
 * Password hashing. In plain words: turns a password into a salted hash and checks a password against a hash. Passwords are stored only as salted hashes. Uses `bcryptjs` (pure JavaScript, no native file: a compiled library can be blocked on managed Windows machines, decision L-50).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.15 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/password-hasher.ts
 * @lld-synced     v0.15
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

/** The bcrypt cost (decision L-50). */
const COST = 12;
/**
 * Password hasher.
 *
 * In plain words: one place that knows how a password is hashed.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.4
 *   contracts: API-USR-07, API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.15 section 6.1
 */
@Injectable()
export class PasswordHasher {
  /**
   * Hashes a password.
   *
   * In plain words: a salted hash that cannot be turned back into the password.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-03
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-07
 * @ac        AC-US007-02
 * @lld       LLD-EPIC-ADM-01 v0.15 §6.1
 * @status    built
   *
   * @dependencies bcryptjs.hash
   *
   * @param plain - the password
   * @returns The hash
   */
  async hash(plain: string): Promise<string> {
    return hash(plain, COST);
  }

  /**
   * Checks a password.
   *
   * In plain words: true when the password matches the hash.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-007
 * @subtask   ST-ADM01-007-BE-03
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-07
 * @ac        AC-US007-02
 * @lld       LLD-EPIC-ADM-01 v0.15 §6.1
 * @status    built
   *
   * @dependencies bcryptjs.compare
   *
   * @param plain - the password
   * @param hash - the stored hash
   * @returns True or false
   */
  async verify(plain: string, stored: string): Promise<boolean> {
    return compare(plain, stored);
  }
}
