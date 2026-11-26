/**
 * @file    pending-password.guard.ts
 * @module  AuthModule
 *
 * @description
 * The password routes. In plain words: thin routes for the reset request, the link check, the new password and the temporary-password change.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-001, US-LGN02-002, US-LGN02-004
 * @subtask        ST-LGN02-001-BE-01
 * @subtask        ST-LGN02-002-BE-01
 * @subtask        ST-LGN02-004-BE-01
 * @contract       API-PWD-01, API-PWD-02, API-PWD-03, API-PWD-04
 * @lld            LLD-EPIC-LGN-02 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/apps/auth-apis/src/guards/pending-password.guard.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UnauthenticatedAppException } from '@libs/common';
import type { AccessClaims, PendingUser } from '@libs/core';

/** A request after the guard: the user read from the access token. */
export type PendingRequest = Request & { pending?: PendingUser };

/**
 * PendingPasswordGuard.
 *
 * In plain words: lets API-PWD-04 in for a user who signed in with a temporary password. It only checks the access token (the sign-in token has no company yet); the service decides whether a change is required.
 *
 * @rtm
 *   epics:     EPIC-LGN-02
 *   stories:   US-LGN02-001, US-LGN02-002, US-LGN02-004
 *   workflows: UF-02
 *   ac:        AC-US-LGN02-001-01, AC-US-LGN02-002-01, AC-US-LGN02-004-02
 *   lld:       LLD-EPIC-LGN-02 v0.3 section 6.0
 */
@Injectable()
export class PendingPasswordGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<PendingRequest>();
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token);
      req.pending = { userId: claims.sub, employeeCode: claims.emp, sid: claims.sid };
      return true;
    } catch {
      throw new UnauthenticatedAppException('UNAUTHENTICATED', 'Sign in to continue');
    }
  }
}
