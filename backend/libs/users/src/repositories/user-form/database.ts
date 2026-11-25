/**
 * @file    database.ts
 * @module  UsersModule
 *
 * @description
 * Prisma implementation of the user form repository. In plain words: reads the user with the assignments valid today and groups them by company.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-form/database.ts
 * @lld-synced     v0.28
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { startOfToday, validToday } from '../user/user-helpers';
import { FormCompany, UserFormData, UserFormRepository } from './contract';

const day = (d: Date): string => d.toISOString().slice(0, 10);

/**
 * Prisma user form repository. In plain words: reads the data of the Edit form from the users and assignments tables.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-BE-01
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.1
 * @status    built
 */
@Injectable()
export class UserFormDatabaseRepository extends UserFormRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Reads the form data.
   *
   * In plain words: the mobile number, department and designation ids, the reporting manager's code and, per company, the role ids with valid-from and valid-to of the assignments valid today.
   *
   * @param employeeCode - the user
   * @returns The form data, or null
   */
  async findFormData(employeeCode: string): Promise<UserFormData | null> {
    const u = await this.prisma.db.user.findUnique({
      where: { employeeCode },
      include: { reportingManager: { select: { employeeCode: true } }, companyRoles: { where: validToday(startOfToday()), orderBy: { validFrom: 'asc' } } },
    });
    if (!u) return null;
    const byCompany = new Map<string, FormCompany>();
    for (const r of u.companyRoles) {
      const c = byCompany.get(r.companyCode) ?? { companyCode: r.companyCode, roleIds: [], validFrom: day(r.validFrom), validTo: r.validTo ? day(r.validTo) : null };
      c.roleIds.push(r.roleId);
      byCompany.set(r.companyCode, c);
    }
    return { mobile: u.mobile, departmentId: u.departmentId, designationId: u.designationId, reportingManagerCode: u.reportingManager?.employeeCode ?? null, companies: [...byCompany.values()] };
  }
}
