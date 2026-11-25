/**
 * @file    database.ts
 * @module  UsersModule
 *
 * @description
 * Prisma implementation of the user repository (minimal, decision L-29). In plain words: the only file in this library that reads the users table.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011
 * @subtask        ST-ADM01-011-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.13 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.13.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user/database.ts
 * @lld-synced     v0.13
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { UserRef, UserRepository } from './contract';

/**
 * Prisma user repository.
 *
 * In plain words: finds users by employee code with their department name.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-011
 *   workflows: AD-03
 *   frd:       FR-042.5, FR-043.4
 *   contracts: API-ROL-05, API-ROL-06
 *   lld:       LLD-EPIC-ADM-01 v0.13 §6.4
 */
@Injectable()
export class UserDatabaseRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Finds users by employee code.
   *
   * In plain words: reads the users with those codes, with the name of their department.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-011
 * @subtask   ST-ADM01-011-BE-04
 * @frd       FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06
 * @ac        AC-US011-01
 * @lld       LLD-EPIC-ADM-01 v0.13 §6.4
 * @status    built
   *
   * @dependencies PrismaService.db user.findMany
   *
   * @param codes - employee codes
   * @returns The users found
   */
  async findByCodes(codes: string[]): Promise<UserRef[]> {
    if (codes.length === 0) return [];
    const users = await this.prisma.db.user.findMany({ where: { employeeCode: { in: codes } }, include: { department: true } });
    return users.map((u) => ({ id: u.id, employeeCode: u.employeeCode, fullName: u.fullName, status: u.status, departmentName: u.department?.name ?? null }));
  }
}
