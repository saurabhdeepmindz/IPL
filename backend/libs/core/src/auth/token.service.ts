/**
 * @file    token.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Tokens. In plain words: makes the 15-minute access token and the rotating refresh token and hashes the refresh token for storage.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-003
 * @subtask        ST-LGN01-003-BE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.3
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/token.service.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { AccessClaims } from './session-user.shape';

/**
 * TokenService.
 *
 * In plain words: makes and checks tokens
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-003
   *   workflows: UF-01
   *   ac:        AC-US-LGN01-003-01, AC-US-LGN01-003-02
   *   lld:       LLD-EPIC-LGN-01 v0.4 section 6.3
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
  ) {}

  /**
   * issueAccess.
   *
   * In plain words: signs the access token
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-003
   * @subtask   ST-LGN01-003-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-003-01
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.3
   * @status    built
   *
   * @dependencies JwtService.signAsync
   *
   * @returns Promise<{ accessToken: string; expiresIn: number }>
   */
  async issueAccess(claims: AccessClaims): Promise<{ accessToken: string; expiresIn: number }> {
    const expiresIn = 15 * 60;
    const accessToken = await this.jwt.signAsync({ ...claims }, { expiresIn });
    return { accessToken, expiresIn };
  }

  /**
   * newRefresh.
   *
   * In plain words: makes a random refresh token and its hash
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-003
   * @subtask   ST-LGN01-003-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-003-01, AC-US-LGN01-003-02
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.3
   * @status    built
   *
   * @returns { token: string; hash: string }
   */
  newRefresh(): { token: string; hash: string } {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: this.hash(token) };
  }

  /**
   * hash.
   *
   * In plain words: hashes a presented refresh token
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-003
   * @subtask   ST-LGN01-003-BE-02
   * @workflow  UF-01
   * @ac        AC-US-LGN01-003-02
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.3
   * @status    built
   *
   * @returns string
   */
  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
