/**
 * @file    company-selection.profile.spec.ts
 * @module  AuthCoreModule
 *
 * @description
 * Jest cases of the profile part of the company selection service (TC-LGN03-001-J01, J02, J04). In plain words: the profile lists only the companies the signed-in user has today, each with the user's roles, and an empty list with the helpdesk values when the user has none.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-001
 * @subtask        ST-LGN03-001-BE-03
 * @lld            LLD-EPIC-LGN-03 v0.2 §6.0
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.2.md
 * @status         elaborated
 */

import { Test } from '@nestjs/testing';
import { AuditService } from '@libs/audit';
import { FinancialYearService, UserCompanyRoleRepository } from '@libs/organisation';
import { SettingsService } from '@libs/settings';
import { UserRepository } from '@libs/users';
import { CompanySelectionService } from './company-selection.service';
import { LandingResolver } from './landing.resolver';
import { SessionContextService } from './session-context.service';

interface CompanyRows {
  companyCode: string;
  companyName: string;
  roles: { roleCode: string; roleName: string; roleStatus: 'ACTIVE' | 'INACTIVE' }[];
}

const A = { userId: 'user-a', employeeCode: '11111', companyCode: 'IPL', departmentId: null };
const B = { userId: 'user-b', employeeCode: '22222', companyCode: 'IPLFB', departmentId: null };
const HELPDESK = { 'helpdesk.phone': '+91 00000 00000', 'helpdesk.email': 'helpdesk@ipl.example', 'helpdesk.hours': 'Mon-Sat, 9:00-18:00', 'helpdesk.placeholder': 'true' } as Record<string, string>;

async function make(byUser: Record<string, CompanyRows[]>) {
  const roles = { listCompaniesByUser: jest.fn(async (userId: string) => byUser[userId] ?? []) };
  const users = { findByCode: jest.fn(async (code: string) => ({ employeeCode: code, fullName: code === '11111' ? 'User A' : 'User B' })) };
  const module = await Test.createTestingModule({
    providers: [
      CompanySelectionService,
      FinancialYearService,
      { provide: UserCompanyRoleRepository, useValue: roles },
      { provide: UserRepository, useValue: users },
      { provide: SettingsService, useValue: { get: (k: string) => HELPDESK[k] ?? '' } },
      { provide: SessionContextService, useValue: {} },
      { provide: LandingResolver, useValue: {} },
      { provide: AuditService, useValue: {} },
    ],
  }).compile();
  return { service: module.get(CompanySelectionService), roles };
}

const initiator = { roleCode: 'INITIATOR', roleName: 'Initiator', roleStatus: 'ACTIVE' as const };
const processor = { roleCode: 'PROCESSOR', roleName: 'Processor', roleStatus: 'ACTIVE' as const };
const retired = { roleCode: 'OLD', roleName: 'Retired role', roleStatus: 'INACTIVE' as const };

describe('CompanySelectionService.profile (US-LGN03-001)', () => {
  /** @tc TC-LGN03-001-J01 @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-03 In plain words: each user sees only the companies mapped to the own employee code. */
  it('TC-LGN03-001-J01 each user sees only the companies of the own employee code', async () => {
    const { service, roles } = await make({
      'user-a': [{ companyCode: 'IPL', companyName: 'Indian Potash Limited', roles: [initiator] }],
      'user-b': [{ companyCode: 'IPLFB', companyName: 'IPL second company', roles: [processor] }],
    });
    const a = await service.profile(A);
    const b = await service.profile(B);
    expect(a.companies.map((c) => c.code)).toEqual(['IPL']);
    expect(b.companies.map((c) => c.code)).toEqual(['IPLFB']);
    expect(roles.listCompaniesByUser).toHaveBeenNthCalledWith(1, 'user-a', expect.any(Date));
    expect(roles.listCompaniesByUser).toHaveBeenNthCalledWith(2, 'user-b', expect.any(Date));
  });

  /** @tc TC-LGN03-001-J02 @story US-LGN03-001 @ac AC-US-LGN03-001-02 @subtask ST-LGN03-001-BE-03 In plain words: a user with several companies sees each with the own roles in it. */
  it('TC-LGN03-001-J02 a user with several companies sees the roles of each', async () => {
    const { service } = await make({
      'user-a': [
        { companyCode: 'IPL', companyName: 'Indian Potash Limited', roles: [initiator, processor] },
        { companyCode: 'IPLFB', companyName: 'IPL second company', roles: [processor] },
      ],
    });
    const profile = await service.profile(A);
    expect(profile.companies).toEqual([
      { code: 'IPL', name: 'Indian Potash Limited', roles: ['Initiator', 'Processor'] },
      { code: 'IPLFB', name: 'IPL second company', roles: ['Processor'] },
    ]);
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-02 @subtask ST-LGN03-001-BE-03 In plain words: supporting test. A role that is not Active is not shown, and a company whose only roles are not Active is not listed. */
  it('keeps only Active roles and drops a company with none', async () => {
    const { service } = await make({
      'user-a': [
        { companyCode: 'IPL', companyName: 'Indian Potash Limited', roles: [initiator, retired] },
        { companyCode: 'IPLFB', companyName: 'IPL second company', roles: [retired] },
      ],
    });
    const profile = await service.profile(A);
    expect(profile.companies).toEqual([{ code: 'IPL', name: 'Indian Potash Limited', roles: ['Initiator'] }]);
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-03 @subtask ST-LGN03-001-BE-03 In plain words: supporting test. The profile carries the name of the user and the year list with the current one marked. */
  it('adds the user name and the years', async () => {
    const { service } = await make({ 'user-a': [{ companyCode: 'IPL', companyName: 'Indian Potash Limited', roles: [initiator] }] });
    const profile = await service.profile(A);
    expect(profile.user).toEqual({ employeeCode: '11111', fullName: 'User A' });
    expect(profile.years).toHaveLength(3);
    expect(profile.years.filter((y) => y.current)).toHaveLength(1);
  });

  /** @story US-LGN03-001 @ac AC-US-LGN03-001-01 @subtask ST-LGN03-001-BE-03 In plain words: supporting test. The company and year of the session are passed on only when both are known. */
  it('passes the session context on only when a company and a year are chosen', async () => {
    const { service } = await make({});
    expect((await service.profile(A)).context).toBeNull();
    expect((await service.profile({ ...A, companyCode: '' })).context).toBeNull();
    expect((await service.profile({ ...A, financialYear: '2026-27' })).context).toEqual({ companyCode: 'IPL', financialYear: '2026-27' });
  });

  /** @tc TC-LGN03-001-J04 @story US-LGN03-001 @ac AC-US-LGN03-001-04 @subtask ST-LGN03-001-BE-03 In plain words: a user with no company valid today gets an empty list and the helpdesk values, not an error. */
  it('TC-LGN03-001-J04 a user with no company gets an empty list and the helpdesk values', async () => {
    const { service } = await make({});
    const profile = await service.profile(A);
    expect(profile.companies).toEqual([]);
    expect(profile.helpdesk).toEqual({ phone: '+91 00000 00000', email: 'helpdesk@ipl.example', hours: 'Mon-Sat, 9:00-18:00', placeholder: true });
  });
});
