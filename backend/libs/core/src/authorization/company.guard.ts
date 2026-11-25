/**
 * @file    company.guard.ts
 * @module  AuthorizationModule
 *
 * @description
 * The guard that keeps a call inside the session company. In plain words: a user signed in to one company cannot ask for another company's records, except an Administrator who is allowed to look at all companies.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/company.guard.ts
 * @lld-synced     v0.27
 * @status         built
 */

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '@libs/audit';
import { PermissionResolver } from './permission-resolver.service';
import { PUBLIC_ROUTE_KEY, SessionUser } from './session-user.interface';

/** Permission that lets an Administrator list the records of ALL companies (decision L-07). */
const VIEW_ALL_COMPANIES = 'companies.view-all';

/** The parts of the request this guard reads and marks. */
interface CompanyRequest {
  user?: SessionUser;
  query?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  allCompanies?: boolean;
}

/**
 * Global guard: company check on every route.
 *
 * In plain words: every request belongs to the company chosen at sign-in.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017, US-ADM01-001
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none (all); API-USR-01 uses ALL
 *   lld:       LLD-EPIC-ADM-01 v0.27 §6.8
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly resolver: PermissionResolver,
    private readonly audit: AuditService,
  ) {}

  /**
   * Allows the call only for the session company.
   *
   * In plain words: if the call names another company it is refused; "ALL" is allowed only with the right to see all companies.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-017
 * @subtask   ST-ADM01-017-BE-03
 * @frd       FR-043.2
 * @workflow  AD-03
 * @screen    none (platform; applies to every screen)
 * @contract  none (applies to every contract)
 * @ac        AC-US017-01, AC-US017-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.8
 * @status    built
   *
   * @dependencies Reflector.getAllAndOverride, PermissionResolver.resolve, AuditService.recordRefusal
   *
   * @async
   * @param context - The call being made
   * @returns True when the call may go on
   * @throws {ForbiddenException} The call names a company that is not the session company (HTTP 403, code COMPANY_MISMATCH)
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, targets)) return true;
    const request = context.switchToHttp().getRequest<CompanyRequest>();
    const user = request.user;
    if (!user) return true; // no session: the permission guard answers 401
    const requested = (request.query?.companyCode as string | undefined) ?? (request.headers?.['x-company-code'] as string | undefined);
    if (!requested || requested === user.companyCode) return true;
    if (requested === 'ALL' && (await this.resolver.resolve(user, VIEW_ALL_COMPANIES)).allowed) {
      request.allCompanies = true;
      return true;
    }
    await this.audit.recordRefusal({ userId: user.userId, companyCode: user.companyCode, permissionKey: VIEW_ALL_COMPANIES, code: 'COMPANY_MISMATCH' });
    throw new ForbiddenException({ code: 'COMPANY_MISMATCH', message: 'You cannot use another company.' });
  }
}
