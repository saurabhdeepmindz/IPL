/**
 * @file    database.ts
 * @module  OrganisationModule
 *
 * @description
 * Database adapter of the masters port. In plain words: answers the department and designation questions from the seeded tables until EPIC-ADM-02 owns the masters (TBD-ADM01-01). The only file here that reads those tables.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/repositories/masters/database.ts
 * @lld-synced     v0.24
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { MastersPort } from '@libs/users/ports/masters.port';

/**
 * Masters database adapter.
 *
 * In plain words: reads departments and designations.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 *   contracts: API-USR-02, API-USR-04
 *   lld:       LLD-EPIC-ADM-01 v0.24 section 6.1
 */
@Injectable()
export class MastersDatabaseAdapter extends MastersPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Department exists.
   *
   * In plain words: true when a department has this id.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-03
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db department.count
   *
   * @param departmentId - the id
   * @returns True or false
   */
  async departmentExists(departmentId: string): Promise<boolean> {
    return (await this.prisma.db.department.count({ where: { id: departmentId } })) === 1;
  }

  /**
   * Designation exists.
   *
   * In plain words: true when a designation has this id.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-03
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db designation.count
   *
   * @param designationId - the id
   * @returns True or false
   */
  async designationExists(designationId: string): Promise<boolean> {
    return (await this.prisma.db.designation.count({ where: { id: designationId } })) === 1;
  }

  /**
   * Highest designation.
   *
   * In plain words: true when the designation is the highest one (the `isHighest` column, decision L-59).
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-03
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-05
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db designation.findUnique
   *
   * @param designationId - the id
   * @returns True or false
   */
  async isHighestDesignation(designationId: string): Promise<boolean> {
    const row = await this.prisma.db.designation.findUnique({ where: { id: designationId }, select: { isHighest: true } });
    return row?.isHighest ?? false;
  }
}
