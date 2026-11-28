/**
 * @file    company-selection.service.spec.ts
 * @module  AuthCoreModule
 *
 * @description
 * Jest cases of the choice part of the company selection service (TC-LGN03-002-J01 to J06). In plain words: a valid choice is stored in the session and gives a new token and the landing page; a company the user does not have today is refused; the landing follows the role order.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-002
 * @subtask        ST-LGN03-002-BE-03
 * @contract       API-ME-02
 * @lld            LLD-EPIC-LGN-03 v0.4 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/libs/core/src/auth/company-selection.service.spec.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { Test } from '@nestjs/testing';
import { AuditService } from '@libs/audit';
import { FinancialYearService, UserCompanyRoleRepository } from '@libs/organisation';
import { SETTING_DEFAULTS, SettingsService } from '@libs/settings';
import { UserRepository } from '@libs/users';
import { CompanySelectionService } from './company-selection.service';
import { CompanyNotAllowedException, InvalidYearException } from './errors/context-errors';
import { LandingResolver } from './landing.resolver';
import { SessionContextService } from './session-context.service';

type Grant = { roleCode: string; roleStatus: 'ACTIVE' | 'INACTIVE' };
const grant = (roleCode: string, roleStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE'): Grant => ({ roleCode, roleStatus });

const user = { userId: 'user-a', employeeCode: '11111', companyCode: '', departmentId: null, sessionId: 'sid-1' };
const YEAR = new FinancialYearService().list(new Date())[0].label;

/** Builds the service with fakes. `grants` maps a company to the roles the user holds there today. */
async function make(grants: Record<string, Grant[]>) {
  const roles = { listByUser: jest.fn(async (_userId: string, companyCode: string) => grants[companyCode] ?? []) };
  const context = { apply: jest.fn(async () => ({ accessToken: 'new-token', expiresIn: 900 })) };
  const audit = { recordChange: jest.fn(async () => 'audit-1') };
  const module = await Test.createTestingModule({
    providers: [
      CompanySelectionService,
      FinancialYearService,
      LandingResolver,
      { provide: UserCompanyRoleRepository, useValue: roles },
      { provide: UserRepository, useValue: {} },
      { provide: SettingsService, useValue: { get: (k: keyof typeof SETTING_DEFAULTS) => SETTING_DEFAULTS[k] } },
      { provide: SessionContextService, useValue: context },
      { provide: AuditService, useValue: audit },
    ],
  }).compile();
  return { service: module.get(CompanySelectionService), roles, context, audit };
}

describe('CompanySelectionService.select (US-LGN03-002)', () => {
  /** @tc TC-LGN03-002-J01 @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-03 In plain words: a valid choice is written into the session and the answer carries the new token. */
  it('TC-LGN03-002-J01 a valid choice is stored in the session and gives a new token', async () => {
    const { service, context } = await make({ IPL: [grant('INITIATOR')] });
    const result = await service.select({ companyCode: 'IPL', financialYear: YEAR }, user);
    expect(context.apply).toHaveBeenCalledTimes(1);
    expect(context.apply).toHaveBeenCalledWith('sid-1', user, 'IPL', YEAR);
    expect(result).toMatchObject({ context: { companyCode: 'IPL', financialYear: YEAR }, accessToken: 'new-token', expiresIn: 900 });
  });

  /** @tc TC-LGN03-002-J02 @story US-LGN03-002 @ac AC-US-LGN03-002-02 @subtask ST-LGN03-002-BE-03 In plain words: a user who chose one company and then another moves to the second; the session holds one company only. */
  it('TC-LGN03-002-J02 choosing another company moves the session to it', async () => {
    const { service, context } = await make({ IPL: [grant('INITIATOR')], IPLFB: [grant('AUDITOR')] });
    await service.select({ companyCode: 'IPL', financialYear: YEAR }, user);
    const second = await service.select({ companyCode: 'IPLFB', financialYear: YEAR }, { ...user, companyCode: 'IPL' });
    expect(context.apply).toHaveBeenLastCalledWith('sid-1', expect.anything(), 'IPLFB', YEAR);
    expect(second.context.companyCode).toBe('IPLFB');
  });

  /** @tc TC-LGN03-002-J03 @story US-LGN03-002 @ac AC-US-LGN03-002-03 @subtask ST-LGN03-002-BE-03 In plain words: a company the user does not have today (no role, or only a role that is not Active) is refused with COMPANY_NOT_ALLOWED and nothing is stored. */
  it('TC-LGN03-002-J03 a company the user does not have today is refused', async () => {
    const { service, context } = await make({ IPL: [grant('INITIATOR')], IPLFB: [grant('OLD', 'INACTIVE')] });
    for (const company of ['IPLFB', 'OTHER']) {
      const refused = await service.select({ companyCode: company, financialYear: YEAR }, user).catch((e) => e);
      expect(refused).toBeInstanceOf(CompanyNotAllowedException);
      expect(refused).toMatchObject({ code: 'COMPANY_NOT_ALLOWED' });
      expect(refused.getStatus()).toBe(403);
    }
    expect(context.apply).not.toHaveBeenCalled();
  });

  /** @tc TC-LGN03-002-J04 @story US-LGN03-002 @ac AC-US-LGN03-002-04 @subtask ST-LGN03-002-BE-03 In plain words: a user with one role in the company gets the landing route of that role. */
  it('TC-LGN03-002-J04 one role gives the landing route of that role', async () => {
    const { service } = await make({ IPL: [grant('FINANCE')] });
    const result = await service.select({ companyCode: 'IPL', financialYear: YEAR }, user);
    expect(result.landing).toEqual({ role: 'FINANCE', route: '/landing/finance' });
  });

  /** @tc TC-LGN03-002-J05 @story US-LGN03-002 @ac AC-US-LGN03-002-05 @subtask ST-LGN03-002-BE-03 In plain words: with several roles the landing follows the order Administrator, Finance, Initiator / Processor, Auditor / Report Viewer. */
  it('TC-LGN03-002-J05 several roles follow the order Administrator, Finance, Initiator / Processor, Auditor / Report Viewer', async () => {
    const cases: [string[], string][] = [
      [['AUDITOR', 'INITIATOR', 'FINANCE', 'ADMINISTRATOR'], 'ADMINISTRATOR'],
      [['REPORT_VIEWER', 'INITIATOR', 'FINANCE'], 'FINANCE'],
      [['AUDITOR', 'PROCESSOR'], 'PROCESSOR'],
      [['REPORT_VIEWER', 'AUDITOR'], 'AUDITOR'],
    ];
    for (const [roles, first] of cases) {
      const { service } = await make({ IPL: roles.map((r) => grant(r)) });
      expect((await service.select({ companyCode: 'IPL', financialYear: YEAR }, user)).landing.role).toBe(first);
    }
  });

  /** @tc TC-LGN03-002-J06 @story US-LGN03-002 @ac AC-US-LGN03-002-06 @subtask ST-LGN03-002-BE-03 In plain words: an initiator only gets the Initiator Dashboard; an initiator who is also a processor gets the Inbox. */
  it('TC-LGN03-002-J06 an initiator gets the Initiator Dashboard, an initiator who is also a processor gets the Inbox', async () => {
    const only = await make({ IPL: [grant('INITIATOR')] });
    expect((await only.service.select({ companyCode: 'IPL', financialYear: YEAR }, user)).landing).toEqual({ role: 'INITIATOR', route: '/landing/initiator' });
    const both = await make({ IPL: [grant('INITIATOR'), grant('PROCESSOR')] });
    expect((await both.service.select({ companyCode: 'IPL', financialYear: YEAR }, user)).landing.route).toBe('/landing/inbox');
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-03 In plain words: supporting test. A year that is not in the list is refused with INVALID_YEAR and nothing is stored. */
  it('refuses a year that is not in the list', async () => {
    const { service, context } = await make({ IPL: [grant('INITIATOR')] });
    const refused = await service.select({ companyCode: 'IPL', financialYear: '1999-00' }, user).catch((e) => e);
    expect(refused).toBeInstanceOf(InvalidYearException);
    expect(refused).toMatchObject({ code: 'INVALID_YEAR' });
    expect(refused.getStatus()).toBe(422);
    expect(context.apply).not.toHaveBeenCalled();
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-01 @subtask ST-LGN03-002-BE-03 In plain words: supporting test. Every choice or switch writes one audit record with the old and the new company and year. */
  it('writes one audit record for a choice and one for a switch', async () => {
    const { service, audit } = await make({ IPL: [grant('INITIATOR')], IPLFB: [grant('AUDITOR')] });
    await service.select({ companyCode: 'IPL', financialYear: YEAR }, user);
    await service.select({ companyCode: 'IPLFB', financialYear: YEAR }, { ...user, companyCode: 'IPL', financialYear: YEAR });
    expect(audit.recordChange).toHaveBeenCalledTimes(2);
    expect(audit.recordChange).toHaveBeenNthCalledWith(1, expect.objectContaining({ entity: 'SessionContext', entityKey: '11111', before: null, after: { companyCode: 'IPL', financialYear: YEAR } }));
    expect(audit.recordChange).toHaveBeenNthCalledWith(2, expect.objectContaining({ before: { companyCode: 'IPL', financialYear: YEAR }, after: { companyCode: 'IPLFB', financialYear: YEAR } }));
  });

  /** @story US-LGN03-002 @ac AC-US-LGN03-002-05 @subtask ST-LGN03-002-BE-03 In plain words: supporting test. The order is the setting `landing.order`; a changed setting changes the landing without code. */
  it('follows the landing order setting', async () => {
    const roles = { listByUser: jest.fn(async () => [grant('ADMINISTRATOR'), grant('FINANCE')]) };
    const module = await Test.createTestingModule({
      providers: [
        CompanySelectionService, FinancialYearService, LandingResolver,
        { provide: UserCompanyRoleRepository, useValue: roles },
        { provide: UserRepository, useValue: {} },
        { provide: SettingsService, useValue: { get: (k: string) => (k === 'landing.order' ? 'FINANCE,ADMINISTRATOR' : '') } },
        { provide: SessionContextService, useValue: { apply: async () => ({ accessToken: 't', expiresIn: 900 }) } },
        { provide: AuditService, useValue: { recordChange: async () => 'a' } },
      ],
    }).compile();
    const result = await module.get(CompanySelectionService).select({ companyCode: 'IPL', financialYear: YEAR }, user);
    expect(result.landing.role).toBe('FINANCE');
  });
});
