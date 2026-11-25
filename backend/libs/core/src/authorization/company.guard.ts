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
 * @lld            LLD-EPIC-ADM-01 v0.5 §6.8
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.5.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/core/src/authorization/company.guard.ts
 * @lld-synced     v0.5
 * @status         pseudo
 */

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '@libs/audit';
import { PermissionResolver } from './permission-resolver.service';
import { PUBLIC_ROUTE_KEY, SessionUser } from './session-user.interface';

/** Permission that lets an Administrator list the records of ALL companies (decision L-07). */
const VIEW_ALL_COMPANIES = 'companies.view-all';

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
 *   lld:       LLD-EPIC-ADM-01 v0.5 §6.8
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
 * @lld       LLD-EPIC-ADM-01 v0.5 §6.8
 * @status    pseudo
   *
   * @dependencies Reflector.getAllAndOverride, PermissionResolver.resolve, AuditService.recordRefusal
   *
   * @async
   * @param context - The call being made
   * @returns True when the call may go on
   * @throws {ForbiddenException} The call names a company that is not the session company (HTTP 403, code COMPANY_MISMATCH)
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // TODO: 1. If the route is PUBLIC_ROUTE_KEY, return true.
    // TODO: 2. requested = query "companyCode" or header "x-company-code"; if none, or equal to the session company, return true.
    // TODO: 3. If requested is "ALL": resolve VIEW_ALL_COMPANIES; if allowed, set request.allCompanies = true and return true.
    // TODO: 4. Otherwise write the refusal (AuditService.recordRefusal, code COMPANY_MISMATCH) and throw ForbiddenException.
    throw new Error('pseudo-code: not implemented');
  }
}
