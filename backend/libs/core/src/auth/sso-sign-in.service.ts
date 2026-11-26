/**
 * @file    sso-sign-in.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Single sign-on. In plain words: runs the round trip through the identity port and starts a session for an active AMS user.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-002
 * @subtask        ST-LGN01-002-BE-02
 * @contract       API-AUTH-02, API-AUTH-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/libs/core/src/auth/sso-sign-in.service.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { IdentityProviderPort } from '@libs/integrations';
import { UserRepository } from '@libs/users';
import { IdentityProviderUnavailableException, NoAmsAccountException, SignInCancelledException } from '@libs/integrations';
import { SessionService } from './session.service';
import { SignInAuditWriter } from './sign-in-audit.writer';
import { SsoStateStore } from './sso-state.store';
import { SsoResult, SignInResultCode } from './sign-in.types';
import { InvalidStateException } from './errors/auth-errors';

/** A return path is local when it starts with one slash and carries no scheme or backslash (open-redirect rule). */
export function isLocalPath(path: string | undefined): path is string {
  return typeof path === 'string' && /^\/(?!\/)[^\\:]*$/.test(path);
}

/**
 * SsoSignInService.
 *
 * In plain words: the single sign-on rules
 *
 * @rtm
   *   epics:     EPIC-LGN-01
   *   stories:   US-LGN01-002
   *   workflows: UF-01
   *   frd:       FR-039.1, FR-039.2, FR-039.4, FR-039.5, FR-039.3, FR-039.6, FR-039.7
   *   contracts: API-AUTH-02, API-AUTH-03
   *   ac:        AC-US-LGN01-002-01, AC-US-LGN01-002-02, AC-US-LGN01-002-05, AC-US-LGN01-002-06, AC-US-LGN01-002-07
   *   lld:       LLD-EPIC-LGN-01 v0.4 section 6.2
 */
@Injectable()
export class SsoSignInService {
  constructor(
    private readonly state: SsoStateStore,
    private readonly idp: IdentityProviderPort,
    private readonly users: UserRepository,
    private readonly sessions: SessionService,
    private readonly audit: SignInAuditWriter,
  ) {}

  /**
   * start.
   *
   * In plain words: starts a round trip
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-02
   * @frd       FR-039.1, FR-039.2, FR-039.4, FR-039.5, FR-039.3, FR-039.6, FR-039.7
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.2
   * @status    built
   *
   * @dependencies SsoStateStore.create, IdentityProviderPort.start
   *
   * @returns Promise<string>
   */
  async start(returnTo: string | undefined): Promise<string> {
    const state = await this.state.create(isLocalPath(returnTo) ? returnTo : undefined);
    return this.idp.start(state);
  }

  /**
   * complete.
   *
   * In plain words: finishes a round trip
   *
   * @epic      EPIC-LGN-01
   * @story     US-LGN01-002
   * @subtask   ST-LGN01-002-BE-02
   * @frd       FR-039.1, FR-039.2, FR-039.4, FR-039.5, FR-039.3, FR-039.6, FR-039.7
   * @workflow  UF-01
   * @contract  API-AUTH-02, API-AUTH-03
   * @ac        AC-US-LGN01-002-01, AC-US-LGN01-002-02, AC-US-LGN01-002-05, AC-US-LGN01-002-06, AC-US-LGN01-002-07
   * @lld       LLD-EPIC-LGN-01 v0.4 §6.2
   * @status    built
   *
   * @dependencies SsoStateStore.consume, IdentityProviderPort.complete, UserRepository.findByCode, SessionService.create, SignInAuditWriter.record
   *
   * @returns Promise<SsoResult>
   */
  async complete(query: Record<string, string>): Promise<SsoResult> {
    const fail = async (kind: 'failed' | 'noaccount' | 'cancelled', code: string): Promise<SsoResult> => {
      const result: SignInResultCode = kind === 'failed' ? 'FAILED' : kind === 'noaccount' ? 'NOACCOUNT' : 'CANCELLED';
      return { ok: false, kind, reference: await this.audit.record({ kind: 'SSO', employeeCode: code, result }) };
    };
    let context: { returnTo?: string };
    try {
      context = await this.state.consume(query.state ?? '');
    } catch (e) {
      if (e instanceof InvalidStateException) return fail('failed', '');
      throw e;
    }
    let employeeCode: string;
    try {
      employeeCode = (await this.idp.complete(query)).employeeCode;
    } catch (e) {
      if (e instanceof NoAmsAccountException) return fail('noaccount', '');
      if (e instanceof SignInCancelledException) return fail('cancelled', '');
      if (e instanceof IdentityProviderUnavailableException) return fail('failed', '');
      throw e;
    }
    const user = await this.users.findCredentials(employeeCode);
    if (!user || user.status !== 'ACTIVE') return fail('noaccount', employeeCode);
    const session = await this.sessions.create({ id: user.id, employeeCode: user.employeeCode, fullName: user.fullName, departmentId: user.departmentId });
    await this.audit.record({ kind: 'SSO', employeeCode, result: 'SUCCESS', userId: user.id });
    return { ok: true, ...session, nextStep: user.mustChangePassword ? 'CHANGE_PASSWORD' : 'CHOOSE_WORK', returnTo: context.returnTo };
  }
}
