/**
 * @file    database.ts
 * @module  UsersModule
 *
 * @description
 * Prisma implementation of the user repository. EXTENDS the minimal file built for US-ADM01-011 with the methods of the users stories.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-011, US-ADM01-001, US-ADM01-003, US-ADM01-005
 * @subtask        ST-ADM01-001-BE-03, ST-ADM01-003-BE-04, ST-ADM01-005-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user/database.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService, UserStatus } from '@libs/database';
import { UserFilter, UserPaging, UserRecord, UserRef, UserRepository } from './contract';
import { ADMINISTRATOR_ROLE_CODE, orderFor, startOfToday, toUserRecord, userInclude, validToday, whereFor } from './user-helpers';

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
 *   lld:       LLD-EPIC-ADM-01 v0.29 §6.4
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
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.4
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

  /**
   * Reads one page of users.
   *
   * In plain words: users with a role row in the company (valid or ended, so leavers stay visible), filtered, searched, ordered and paged.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-001
 * @subtask   ST-ADM01-001-BE-03
 * @frd       FR-042.1, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-01
 * @ac        AC-US001-01, AC-US001-02
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db or raw user.findMany, user.count
   *
   * @param filter - company, status, text, department, role, sign-in type
   * @param paging - page, page size, sort
   * @returns The rows and the total
   */
  async findPage(filter: UserFilter, paging: UserPaging): Promise<{ rows: UserRecord[]; total: number }> {
    // null asks for every company, so it reads the unfiltered client on purpose (decision L-42).
    const client = filter.companyCode === null ? this.prisma.raw : this.prisma.db;
    const where = whereFor(filter, true);
    const [rows, total] = await Promise.all([
      client.user.findMany({ where, include: userInclude(startOfToday()), orderBy: orderFor(paging.sort), skip: (paging.page - 1) * paging.pageSize, take: paging.pageSize }),
      client.user.count({ where }),
    ]);
    return { rows: rows.map(toUserRecord), total };
  }

  /**
   * Counts users by status.
   *
   * In plain words: one grouped count for the tabs.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-001
 * @subtask   ST-ADM01-001-BE-03
 * @frd       FR-042.1, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-01
 * @ac        AC-US001-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db or raw user.groupBy
   *
   * @param filter - the same filters as the list
   * @returns The count per status (ACTIVE, INACTIVE, LOCKED)
   */
  async countByStatus(filter: UserFilter): Promise<Record<UserStatus, number>> {
    const client = filter.companyCode === null ? this.prisma.raw : this.prisma.db;
    const groups = await client.user.groupBy({ by: ['status'], where: whereFor(filter, false), _count: { _all: true } });
    const counts: Record<UserStatus, number> = { ACTIVE: 0, INACTIVE: 0, LOCKED: 0 };
    for (const g of groups) counts[g.status] = g._count._all;
    return counts;
  }

  /**
   * Finds a user by employee code.
   *
   * In plain words: the full record with department, designation and company roles.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-04
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US003-03
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db user.findUnique
   *
   * @param employeeCode - the code
   * @returns The user or null
   */
  async findByCode(employeeCode: string): Promise<UserRecord | null> {
    const u = await this.prisma.db.user.findUnique({ where: { employeeCode }, include: userInclude(startOfToday()) });
    return u ? toUserRecord(u) : null;
  }

  /**
   * Finds a user by e-mail.
   *
   * In plain words: used to refuse an e-mail that is taken.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-04
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02
 * @ac        AC-US003-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.db user.findFirst
   *
   * @param email - the address
   * @returns The user or null
   */
  async findByEmail(email: string): Promise<UserRecord | null> {
    const u = await this.prisma.db.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, include: userInclude(startOfToday()) });
    return u ? toUserRecord(u) : null;
  }

  /**
   * Counts active Administrators.
   *
   * In plain words: the number of Active users who hold the Administrator role today in any company.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-005
 * @subtask   ST-ADM01-005-BE-03
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US005-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.raw user.count
   *
   * @returns The count
   */
  async adminCount(): Promise<number> {
    // Counted across every company, so it reads the unfiltered client on purpose (decision L-54).
    const holds = { role: { code: ADMINISTRATOR_ROLE_CODE }, ...validToday(startOfToday()) };
    return this.prisma.raw.user.count({ where: { status: 'ACTIVE', companyRoles: { some: holds } } });
  }

  /**
   * Is the user an Administrator.
   *
   * In plain words: true when the user holds the Administrator role today in any company.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-005
 * @subtask   ST-ADM01-005-BE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-05
 * @ac        AC-US005-01
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies PrismaService.raw userCompanyRole.count
   *
   * @param userId - the user
   * @returns true or false
   */
  async isAdministrator(userId: string): Promise<boolean> {
    // Any company, so it reads the unfiltered client on purpose (decision L-54).
    const holds = { userId, role: { code: ADMINISTRATOR_ROLE_CODE }, ...validToday(startOfToday()) };
    return (await this.prisma.raw.userCompanyRole.count({ where: holds })) > 0;
  }
}
