/**
 * @file    company-selection.service.ts
 * @module  AuthCoreModule
 *
 * @description
 * Company selection. In plain words: lists the companies and roles a user can work in today (API-ME-01) and sets the company and year of the session (API-ME-02).
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-001, US-LGN03-002
 * @subtask        ST-LGN03-001-BE-02
 * @subtask        ST-LGN03-002-BE-02
 * @contract       API-ME-01, API-ME-02
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/company-selection.service.ts
 * @lld-synced     v0.3
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { FinancialYearService, UserCompanyRoleRepository } from '@libs/organisation';
import { SettingsService } from '@libs/settings';
import { UserRepository } from '@libs/users';
import { SessionUser } from '../authorization/session-user.interface';
import { SessionEndedException } from './errors/auth-errors';
import { CompanyNotAllowedException, InvalidYearException } from './errors/context-errors';
import { LandingResolver } from './landing.resolver';
import { ContextResult, MeCompany, ProfileInput } from './me-profile.types';
import { SessionContextService } from './session-context.service';

/**
 * CompanySelectionService.
 *
 * In plain words: the company and year rules
 *
 * @rtm
 *   epics:     EPIC-LGN-03
 *   stories:   US-LGN03-001, US-LGN03-002
 *   workflows: UF-03
 *   frd:       FR-040.1, FR-040.2, FR-040.3, FR-040.4, FR-040.5
 *   contracts: API-ME-01, API-ME-02
 *   ac:        AC-US-LGN03-001-01, AC-US-LGN03-001-02, AC-US-LGN03-001-03, AC-US-LGN03-001-04, AC-US-LGN03-002-01, AC-US-LGN03-002-02, AC-US-LGN03-002-03, AC-US-LGN03-002-04, AC-US-LGN03-002-05, AC-US-LGN03-002-06
 *   lld:       LLD-EPIC-LGN-03 v0.3 section 6.0
 */
@Injectable()
export class CompanySelectionService {
  constructor(
    private readonly roles: UserCompanyRoleRepository,
    private readonly users: UserRepository,
    private readonly years: FinancialYearService,
    private readonly settings: SettingsService,
    private readonly context: SessionContextService,
    private readonly landing: LandingResolver,
    private readonly audit: AuditService,
  ) {}

  /**
   * profile.
   *
   * In plain words: collects what the profile needs: the user's name, the companies the user can work in today with the Active roles in each, the financial years, the company and year already chosen in this session, and the helpdesk values.
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-001
   * @subtask   ST-LGN03-001-BE-02
   * @frd       FR-040.1, FR-040.2, FR-040.3, FR-040.4, FR-040.5
   * @workflow  UF-03
   * @contract  API-ME-01
   * @ac        AC-US-LGN03-001-01, AC-US-LGN03-001-02, AC-US-LGN03-001-03, AC-US-LGN03-001-04
   * @lld       LLD-EPIC-LGN-03 v0.3 §6.0
   * @status    built
   *
   * @dependencies UserRepository.findByCode, UserCompanyRoleRepository.listCompaniesByUser, FinancialYearService.list, SettingsService.get
   *
   * @param user The signed-in user (the session may have no company yet)
   * @returns What the profile body is made from
   */
  async profile(user: SessionUser): Promise<ProfileInput> {
    const now = new Date();
    const record = await this.users.findByCode(user.employeeCode);
    const grants = await this.roles.listCompaniesByUser(user.userId, now);
    return {
      user: { employeeCode: user.employeeCode, fullName: record?.fullName ?? '' },
      companies: this.activeCompanies(grants),
      years: this.years.list(now),
      context: user.companyCode && user.financialYear ? { companyCode: user.companyCode, financialYear: user.financialYear } : null,
      helpdesk: {
        phone: this.settings.get('helpdesk.phone'),
        email: this.settings.get('helpdesk.email'),
        hours: this.settings.get('helpdesk.hours'),
        placeholder: this.settings.get('helpdesk.placeholder') === 'true',
      },
    };
  }

  /**
   * select.
   *
   * In plain words: checks that the company is one of the user's companies today and the year is in the list, stores both in the session, picks the landing page from the user's roles in that company, writes the audit record and returns the context, the landing and the new access token.
   *
   * @epic      EPIC-LGN-03
   * @story     US-LGN03-002
   * @subtask   ST-LGN03-002-BE-02
   * @frd       FR-040.1, FR-040.2, FR-040.3, FR-040.4, FR-040.5
   * @workflow  UF-03
   * @contract  API-ME-02
   * @ac        AC-US-LGN03-002-01, AC-US-LGN03-002-02, AC-US-LGN03-002-03, AC-US-LGN03-002-04, AC-US-LGN03-002-05, AC-US-LGN03-002-06
   * @lld       LLD-EPIC-LGN-03 v0.3 §6.0
   * @status    built
   *
   * @dependencies UserCompanyRoleRepository.listByUser, FinancialYearService.isValid, SessionContextService.apply, LandingResolver.resolve, SettingsService.get, AuditService.recordChange
   *
   * @param dto The company code and financial year chosen
   * @param user The signed-in user (with the session id)
   * @returns The context, the landing page and the new access token
   * @throws CompanyNotAllowedException The company is not one of the user's companies today (403)
   * @throws InvalidYearException The year is not in the list (422)
   * @throws SessionEndedException The token carries no session
   */
  async select(dto: { companyCode: string; financialYear: string }, user: SessionUser): Promise<ContextResult> {
    const now = new Date();
    const held = (await this.roles.listByUser(user.userId, dto.companyCode, now)).filter((g) => g.roleStatus === 'ACTIVE');
    if (held.length === 0) throw new CompanyNotAllowedException();
    if (!this.years.isValid(dto.financialYear, now)) throw new InvalidYearException();
    if (!user.sessionId) throw new SessionEndedException();
    const token = await this.context.apply(user.sessionId, user, dto.companyCode, dto.financialYear);
    const order = this.settings.get('landing.order').split(',').map((code) => code.trim()).filter(Boolean);
    const landing = this.landing.resolve(held.map((g) => g.roleCode), order);
    const after = { companyCode: dto.companyCode, financialYear: dto.financialYear };
    const before = user.companyCode && user.financialYear ? { companyCode: user.companyCode, financialYear: user.financialYear } : null;
    await this.audit.recordChange({ actor: user.employeeCode, companyCode: dto.companyCode, entity: 'SessionContext', entityKey: user.employeeCode, before, after, reason: before ? 'Company switched' : 'Company chosen' });
    return { context: after, landing, accessToken: token.accessToken, expiresIn: token.expiresIn };
  }

  /** Keeps only the Active roles, and drops a company that has none left. */
  private activeCompanies(grants: Awaited<ReturnType<UserCompanyRoleRepository['listCompaniesByUser']>>): MeCompany[] {
    return grants
      .map((g) => ({ code: g.companyCode, name: g.companyName, roles: g.roles.filter((r) => r.roleStatus === 'ACTIVE').map((r) => r.roleName) }))
      .filter((c) => c.roles.length > 0);
  }
}
