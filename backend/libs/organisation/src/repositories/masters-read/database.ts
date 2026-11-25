/**
 * @file    database.ts
 * @module  OrganisationModule
 *
 * @description
 * Prisma implementation of the masters read repository. In plain words: the only file that reads these three tables for the screens.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/repositories/masters-read/database.ts
 * @lld-synced     v0.29
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { CompanyRow, DepartmentRow, DesignationRow, MastersReadRepository } from './contract';

/**
 * Prisma masters read repository. In plain words: reads departments, designations and active companies.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-BE-01
 * @frd       FR-042.1, FR-042.2, FR-042.3, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-MST-01, API-MST-02, API-MST-03
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.29 §6.3
 * @status    built
 *
 * @dependencies PrismaService.raw
 *
 * @returns The lists
 */
@Injectable()
export class MastersReadDatabaseRepository extends MastersReadRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async departments(): Promise<DepartmentRow[]> {
    return this.prisma.raw.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, code: true, name: true } });
  }

  async designations(): Promise<DesignationRow[]> {
    return this.prisma.raw.designation.findMany({ orderBy: { name: 'asc' }, select: { id: true, code: true, name: true, isHighest: true } });
  }

  async companies(): Promise<CompanyRow[]> {
    return this.prisma.raw.company.findMany({ where: { isActive: true }, orderBy: { code: 'asc' }, select: { code: true, name: true } });
  }
}
