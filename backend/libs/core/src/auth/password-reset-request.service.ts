/**
 * @file    password-reset-request.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Reset requests. In plain words: answers every request the same way and, only for a matching local user, queues the reset e-mail with a 30-minute single-use link.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-001
 * @subtask        ST-LGN02-001-BE-02
 * @contract       API-PWD-01
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/libs/core/src/auth/password-reset-request.service.ts
 * @lld-synced     v0.5
 * @status         built
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'node:crypto';
import { AuditService } from '@libs/audit';
import { Mailman } from '@libs/mailman';
import { RateLimiterService } from '@libs/security';
import { SettingsService } from '@libs/settings';
import { UserRepository } from '@libs/users';
import { RateLimitedException } from './errors/auth-errors';
import { PasswordResetTokenRepository } from './repositories/password-reset-token/contract';

/** The same answer for every request. */
const MESSAGE = 'If the employee code and e-mail match an AMS password account, we have sent a link to set a new password.';

/**
 * PasswordResetRequestService.
 *
 * In plain words: takes a request for a reset link. The answer is the same for every pair; a link is made and mailed only when an active user with an AMS password has that code and e-mail.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-001
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-001-01, AC-US-LGN02-001-02, AC-US-LGN02-001-03, AC-US-LGN02-001-04, AC-US-LGN02-001-05
 *   lld:       LLD-EPIC-LGN-02 v0.5 section 6.0
 */
@Injectable()
export class PasswordResetRequestService {
  private readonly logger = new Logger(PasswordResetRequestService.name);

  constructor(
    private readonly rates: RateLimiterService,
    private readonly tokens: PasswordResetTokenRepository,
    private readonly users: UserRepository,
    private readonly mail: Mailman,
    private readonly audit: AuditService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Handles one request.
   *
   * In plain words: counts the request (429 when too many), then makes and queues a link only for a matching user; always answers the same text.
   *
 * @epic      EPIC-LGN-02
 * @story     US-LGN02-001
 * @subtask   ST-LGN02-001-BE-02
 * @workflow  UF-02
 * @ac        AC-US-LGN02-001-01, AC-US-LGN02-001-02, AC-US-LGN02-001-03, AC-US-LGN02-001-04, AC-US-LGN02-001-05
 * @lld       LLD-EPIC-LGN-02 v0.5 §6.0
 * @status    built
   *
   * @dependencies RateLimiterService.hit, UserRepository.findByCode, PasswordResetTokenRepository.issue, Mailman.send, AuditService.recordChange
   *
   * @throws RateLimitedException when the address or the code asked too often
   */
  async request(dto: { employeeCode: string; email: string }, address: string): Promise<{ message: string; retryAfterSeconds: number }> {
    const gap = this.settings.getNumber('password.resetGapSeconds');
    await this.limits(dto.employeeCode, address);
    const wait = await this.rates.hit(`pwdreset:gap:${dto.employeeCode}`, 1, gap);
    if (!wait.allowed) return { message: MESSAGE, retryAfterSeconds: wait.retryAfterSeconds };
    const user = await this.users.findByCode(dto.employeeCode);
    const matched = !!user && user.authType === 'LOCAL' && user.status === 'ACTIVE' && user.email.toLowerCase() === dto.email.trim().toLowerCase();
    if (matched && user) await this.issueAndSend(user);
    else this.dummyToken();
    await this.audit.recordChange({ actor: 'anonymous', entity: 'PasswordReset', entityKey: dto.employeeCode, after: { event: 'RESET_REQUESTED', matched }, reason: 'Reset link requested' });
    return { message: MESSAGE, retryAfterSeconds: gap };
  }

  private async limits(code: string, address: string): Promise<void> {
    const window = this.settings.getNumber('password.resetWindowSeconds');
    const checks: [string, number][] = [
      [`pwdreset:addr:${address}`, this.settings.getNumber('password.resetLimitPerAddress')],
      [`pwdreset:emp:${code}`, this.settings.getNumber('password.resetLimitPerCode')],
    ];
    for (const [key, limit] of checks) {
      const hit = await this.rates.hit(key, limit, window);
      if (!hit.allowed) throw new RateLimitedException(hit.retryAfterSeconds);
    }
  }

  private async issueAndSend(user: { id: string; fullName: string; email: string }): Promise<void> {
    const token = randomBytes(32).toString('base64url');
    await this.tokens.issue(user.id, createHash('sha256').update(token).digest('hex'));
    const base = this.config.get<string>('WEB_BASE_URL') ?? 'http://localhost:3001';
    try {
      await this.mail.send(user.email, 'reset-link', { fullName: user.fullName, link: `${base}/set-password?token=${token}` });
    } catch (error) {
      this.logger.error('The reset e-mail could not be queued: ' + (error as Error).message);
    }
  }

  /** The same work as for a real user, so the time does not tell a match from a miss. */
  private dummyToken(): void {
    createHash('sha256').update(randomBytes(32).toString('base64url')).digest('hex');
  }
}
