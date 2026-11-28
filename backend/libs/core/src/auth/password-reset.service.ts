/**
 * @file    password-reset.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Reset links. In plain words: checks a link and sets the new password, using the link up and ending the other sessions of the user.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-002
 * @subtask        ST-LGN02-002-BE-02
 * @contract       API-PWD-02, API-PWD-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/password-reset.service.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { AuditService } from '@libs/audit';
import { SettingsService } from '@libs/settings';
import { PasswordHasher, UserPasswordWrites } from '@libs/users';
import { LinkExpiredException } from './errors';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordResetTokenRepository, ResetTokenOwner } from './repositories/password-reset-token/contract';
import { SessionService } from './session.service';

const sha = (token: string): string => createHash('sha256').update(token).digest('hex');

/** `ak\u2022\u2022\u2022@ipl.example`: the first 2 characters, dots, then the domain. */
function mask(email: string): string {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}\u2022\u2022\u2022@${domain}`;
}

/**
 * PasswordResetService.
 *
 * In plain words: checks a reset link and sets the new password with it. A link that is used, old or replaced is refused alike (410 LINK_EXPIRED).
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-002
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-002-01, AC-US-LGN02-002-02
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class PasswordResetService {
  constructor(
    private readonly tokens: PasswordResetTokenRepository,
    private readonly policy: PasswordPolicyService,
    private readonly hasher: PasswordHasher,
    private readonly writes: UserPasswordWrites,
    private readonly sessions: SessionService,
    private readonly audit: AuditService,
    private readonly settings: SettingsService,
  ) {}

  /**
   * Checks that a link is still valid.
   *
   * In plain words: answers valid and the masked e-mail address, or 410.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-002
 * @subtask   ST-LGN02-002-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-002-01
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.0
 * @status    built
   *
   * @throws LinkExpiredException
   */
  async checkLink(token: string): Promise<{ valid: true; maskedEmail: string }> {
    const owner = await this.owner(token);
    return { valid: true, maskedEmail: mask(owner.email) };
  }

  /**
   * Sets a new password with a link.
   *
   * In plain words: checks the link and the policy first (a refused password does not burn the link), then saves the hash, keeps the history, uses the link up and ends the other sessions of the user.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-002
 * @subtask   ST-LGN02-002-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-002-01, AC-US-LGN02-002-02
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.0
 * @status    built
   *
   * @dependencies PasswordPolicyService.check, PasswordHasher.hash, UserPasswordWrites.setPasswordHash, SessionService.endAll
   *
   * @throws LinkExpiredException, PasswordPolicyException, PasswordReusedException
   */
  async setPassword(dto: { token: string; newPassword: string }): Promise<{ done: true }> {
    const owner = await this.owner(dto.token);
    await this.policy.check(owner.userId, dto.newPassword);
    if (!(await this.tokens.markUsed(sha(dto.token)))) throw new LinkExpiredException();
    const hash = await this.hasher.hash(dto.newPassword);
    await this.writes.setPasswordHash(owner.userId, hash, 'bcrypt');
    await this.policy.remember(owner.userId, hash);
    await this.sessions.endAll(owner.userId);
    await this.audit.recordChange({ actor: owner.userId, entity: 'PasswordReset', entityKey: owner.userId, after: { event: 'PASSWORD_RESET' }, reason: 'Password reset with a link' });
    return { done: true };
  }

  private async owner(token: string): Promise<ResetTokenOwner> {
    const owner = await this.tokens.findValid(sha(token), new Date(), this.settings.getNumber('password.resetMinutes'));
    if (!owner) throw new LinkExpiredException();
    return owner;
  }
}
