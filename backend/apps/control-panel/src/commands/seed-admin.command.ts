/**
 * @file    seed-admin.command.ts
 * @module  ControlPanel
 *
 * @description
 * Command seed:admin. In plain words: creates the first Administrator from SEED_ADMIN_EMPLOYEE_CODE and SEED_ADMIN_EMAIL, and gives the Administrator role in company IPL. No password is created or printed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-07
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { processEnv } from '@config';

/**
 * seed:admin.
 *
 * In plain words: the first Administrator signs in with single sign-on or gets a one-time password later; this command sets no password.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: AD-03
 *   frd:       FR-043.2
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class SeedAdminCommand {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run the command.
   *
   * In plain words: stops with a clear message when a variable is missing; otherwise adds the user and the role, once.
   *
   * @param env The environment (the process environment by default)
   * @returns The employee code of the Administrator
   * @throws Error naming the missing variables, or the missing role or company (run seed:roles and seed:masters first)
   * @dependencies PrismaService.raw
   */
  async run(env: NodeJS.ProcessEnv = processEnv()): Promise<{ employeeCode: string }> {
    const code = env.SEED_ADMIN_EMPLOYEE_CODE;
    const email = env.SEED_ADMIN_EMAIL;
    const missing = [!code && 'SEED_ADMIN_EMPLOYEE_CODE', !email && 'SEED_ADMIN_EMAIL'].filter(Boolean);
    if (missing.length > 0 || !code || !email) {
      throw new Error(`seed:admin cannot run: set ${missing.join(' and ')} in the environment`);
    }
    const db = this.prisma.raw;
    const role = await db.role.findUnique({ where: { code: 'ADMINISTRATOR' } });
    const company = await db.company.findUnique({ where: { code: 'IPL' } });
    if (!role || !company) throw new Error('seed:admin needs the roles and the company: run seed:roles and seed:masters first');
    const user = await db.user.upsert({
      where: { employeeCode: code },
      update: {},
      create: { employeeCode: code, fullName: 'System Administrator', email, status: 'ACTIVE', authType: 'SSO' },
    });
    const has = await db.userCompanyRole.findFirst({ where: { userId: user.id, roleId: role.id, companyCode: company.code } });
    if (!has) {
      await db.userCompanyRole.create({
        data: { userId: user.id, roleId: role.id, companyCode: company.code, validFrom: new Date(), assignedBy: code },
      });
    }
    return { employeeCode: user.employeeCode };
  }
}
