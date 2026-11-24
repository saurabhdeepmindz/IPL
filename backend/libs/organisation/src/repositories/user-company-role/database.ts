/**
 * @file    database.ts
 * @module  OrganisationModule
 *
 * @description
 * Prisma implementation of the user-company-role repository. In plain words: the only file here that talks to the database.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-08
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { UserCompanyRoleRepository, UserRoleGrant } from './contract';

/**
 * Database implementation of UserCompanyRoleRepository.
 *
 * In plain words: reads the user_company_roles table.
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
export class UserCompanyRoleDatabaseRepository extends UserCompanyRoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** {@inheritDoc UserCompanyRoleRepository.listByUser} */
  async listByUser(userId: string, companyCode: string, validOn: Date): Promise<UserRoleGrant[]> {
    const rows = await this.prisma.db.userCompanyRole.findMany({
      where: {
        userId,
        companyCode,
        validFrom: { lte: validOn },
        OR: [{ validTo: null }, { validTo: { gte: validOn } }],
      },
      include: { role: true },
    });
    return rows.map((r) => ({
      roleId: r.roleId,
      roleCode: r.role.code,
      roleStatus: r.role.status,
      validFrom: r.validFrom,
      validTo: r.validTo,
    }));
  }
}
