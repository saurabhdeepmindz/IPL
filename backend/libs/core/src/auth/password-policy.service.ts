/**
 * @file    password-policy.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * The password policy. In plain words: checks length, upper and lower case, number, symbol and that the password is not one of the last three.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-003, US-LGN02-002, US-LGN02-004
 * @subtask        ST-LGN02-003-BE-02
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/password-policy.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { SettingsService } from '@libs/settings';
import { PasswordHasher } from '@libs/users';
import { PasswordPolicyException, PasswordReusedException } from './errors/password-errors';
import { PasswordHistoryRepository } from './repositories/password-history/contract';

/** The hash method of every new hash (PasswordHasher uses bcrypt). */
const HASH_TYPE = 'bcrypt';

/**
 * PasswordPolicyService.
 *
 * In plain words: one policy for every password: the length and the four kinds of character, and not one of the last three used.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-002, US-LGN02-003, US-LGN02-004
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-003-01, AC-US-LGN02-003-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
@Injectable()
export class PasswordPolicyService {
  constructor(
    private readonly history: PasswordHistoryRepository,
    private readonly hasher: PasswordHasher,
    private readonly settings: SettingsService,
  ) {}

  /**
   * Lists the rules a candidate breaks (the browser shows the same rules; the server is the judge).
   *
   * In plain words: returns the codes of every rule that is not met, empty when the password is fine.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-003
 * @subtask   ST-LGN02-003-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-003-01
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.0
 * @status    built
   *
   * @returns Rule codes: MIN_LENGTH, UPPER, LOWER, NUMBER, SYMBOL
   */
  unmetRules(candidate: string): string[] {
    const unmet: string[] = [];
    if (candidate.length < this.settings.getNumber('password.minLength')) unmet.push('MIN_LENGTH');
    if (!/[A-Z]/.test(candidate)) unmet.push('UPPER');
    if (!/[a-z]/.test(candidate)) unmet.push('LOWER');
    if (!/[0-9]/.test(candidate)) unmet.push('NUMBER');
    if (!/[^A-Za-z0-9]/.test(candidate)) unmet.push('SYMBOL');
    return unmet;
  }

  /**
   * Refuses a password that breaks the policy.
   *
   * In plain words: lists every broken rule, then refuses a password equal to one of the last three.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-003
 * @subtask   ST-LGN02-003-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-003-01, AC-US-LGN02-003-02
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.0
 * @status    built
   *
   * @dependencies PasswordHistoryRepository.lastHashes, PasswordHasher.verify
   *
   * @throws PasswordPolicyException, PasswordReusedException
   */
  async check(userId: string, candidate: string): Promise<void> {
    const unmet = this.unmetRules(candidate);
    if (unmet.length) throw new PasswordPolicyException(unmet, this.settings.getNumber('password.minLength'));
    const hashes = await this.history.lastHashes(userId, this.settings.getNumber('password.historyCount'));
    for (const h of hashes) {
      if (await this.hasher.verify(candidate, h)) throw new PasswordReusedException();
    }
  }

  /**
   * Adds a new hash to the history and keeps the newest three.
   *
   * In plain words: remembers the password so it cannot come back.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-003
 * @subtask   ST-LGN02-003-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-003-02
 * @lld       LLD-EPIC-LGN-02 v0.3 §6.0
 * @status    built
   *
   * @dependencies PasswordHistoryRepository.add, PasswordHistoryRepository.trim
   */
  async remember(userId: string, hash: string): Promise<void> {
    await this.history.add(userId, hash, HASH_TYPE);
    await this.history.trim(userId, this.settings.getNumber('password.historyCount'));
  }
}
