/**
 * @file    user-helpers.ts
 * @module  UsersModule
 *
 * @description
 * Small functions used by the Prisma user repository. In plain words: the day, the filters of the list, the order, and the mapping of a row to a user record, kept apart so the repository file stays short. Holds no class.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.23 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.23.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user/user-helpers.ts
 * @lld-synced     v0.23
 * @status         built
 */

import { Prisma } from '@libs/database';
import { UserFilter, UserRecord } from './contract';

/** Code of the Administrator role. The roles library holds the same constant; this library must not import it (decision L-54). */
export const ADMINISTRATOR_ROLE_CODE = 'ADMINISTRATOR';

/** The start of today in UTC, the way the date columns are compared. */
export const startOfToday = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/** An assignment that counts today: it has started and has not ended. */
export const validToday = (today: Date): Prisma.UserCompanyRoleWhereInput => ({ validFrom: { lte: today }, OR: [{ validTo: null }, { validTo: { gte: today } }] });

/** What to read with a user so a record can be made. */
export const userInclude = (today: Date) =>
  ({ department: true, designation: true, companyRoles: { where: validToday(today), include: { role: true } } }) satisfies Prisma.UserInclude;

/** A user row read with `userInclude`. */
export type UserRow = Prisma.UserGetPayload<{ include: ReturnType<typeof userInclude> }>;

/** The where of the user list for these filters (decisions L-42, L-43). The status tab is added by the caller only for the page. */
export function whereFor(filter: UserFilter, withStatus: boolean): Prisma.UserWhereInput {
  const holds: Prisma.UserCompanyRoleWhereInput = { ...(filter.companyCode === null ? {} : { companyCode: filter.companyCode }), ...(filter.roleId ? { roleId: filter.roleId } : {}) };
  const where: Prisma.UserWhereInput = { companyRoles: { some: holds } };
  if (withStatus && filter.status) where.status = filter.status;
  if (filter.departmentId) where.departmentId = filter.departmentId;
  if (filter.signIn) where.authType = filter.signIn;
  if (filter.q) {
    const contains = { contains: filter.q, mode: 'insensitive' as const };
    where.OR = [{ employeeCode: contains }, { fullName: contains }, { email: contains }];
  }
  return where;
}

/** The order of the list: `name:asc`, `employeeCode:desc`, `status:asc` or `department:asc`. */
export function orderFor(sort: string): Prisma.UserOrderByWithRelationInput[] {
  const [field, dir] = sort.split(':');
  const d = dir === 'desc' ? 'desc' : 'asc';
  const by: Record<string, Prisma.UserOrderByWithRelationInput> = {
    name: { fullName: d },
    employeeCode: { employeeCode: d },
    status: { status: d },
    department: { department: { name: d } },
  };
  return [by[field] ?? { fullName: 'asc' }, { employeeCode: 'asc' }];
}

/** A user row as a user record, with the roles grouped by company. */
export function toUserRecord(u: UserRow): UserRecord {
  const byCompany = new Map<string, string[]>();
  for (const r of u.companyRoles) byCompany.set(r.companyCode, [...(byCompany.get(r.companyCode) ?? []), r.role.name]);
  return {
    id: u.id,
    employeeCode: u.employeeCode,
    fullName: u.fullName,
    email: u.email,
    mobile: u.mobile,
    departmentId: u.departmentId,
    departmentName: u.department?.name ?? null,
    designationId: u.designationId,
    designationName: u.designation?.name ?? null,
    reportingManagerId: u.reportingManagerId,
    authType: u.authType,
    status: u.status,
    firstSignInAt: u.firstSignInAt,
    lastSignInAt: u.lastSignInAt,
    mustChangePassword: u.mustChangePassword,
    companies: [...byCompany.entries()].map(([code, roles]) => ({ code, roles: roles.sort() })),
  };
}
