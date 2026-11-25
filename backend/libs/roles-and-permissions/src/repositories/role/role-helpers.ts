/**
 * @file    role-helpers.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Small functions used by the Prisma role repository. In plain words: the date, the code, the user count and the cell writing, kept apart so the repository file stays short. Only `libs/roles-and-permissions` repository files use it; it holds no class.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/repositories/role/role-helpers.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { BadRequestAppException } from '@libs/common';
import { Prisma, PrismaService } from '@libs/database';
import { RoleCellInput, RoleRecord } from './contract';

/** A role row as Prisma returns it. */
type Role = Prisma.RoleGetPayload<Record<string, never>>;

/** The start of today in UTC, the way the date columns are compared. */
export const startOfToday = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/** Makes a role code from a name: upper case, other characters to underscores, at most 30 characters including the suffix. */
export const codeFrom = (name: string, suffix = ''): string =>
  name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30 - suffix.length) + suffix;

/** A role row plus its user count, in the shape the service uses. */
export const toRecord = (role: Role, userCount: number): RoleRecord => {
  const { id, code, name, description, type, status, isLocked, updatedAt } = role;
  return { id, code, name, description, type, status, isLocked, updatedAt, userCount };
};

/**
 * Distinct users who hold each role today, in any company.
 *
 * In plain words: counts people, not rows, and reads the unfiltered client on purpose (decision L-12).
 *
 * @param prisma The database service
 * @param roleIds The roles to count
 * @returns The count of users per role id
 */
export async function holdersByRole(prisma: PrismaService, roleIds: string[]): Promise<Map<string, number>> {
  const today = startOfToday();
  const rows = await prisma.raw.userCompanyRole.findMany({
    where: { roleId: { in: roleIds }, validFrom: { lte: today }, OR: [{ validTo: null }, { validTo: { gte: today } }] },
    select: { roleId: true, userId: true },
    distinct: ['roleId', 'userId'],
  });
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.roleId, (counts.get(r.roleId) ?? 0) + 1);
  return counts;
}

/**
 * Writes one cell per permission for a role: the given value, or not allowed.
 *
 * In plain words: after this the role has exactly the cells given; an unknown permission key stops it before anything is written.
 *
 * @param tx The open transaction
 * @param roleId The role
 * @param cells The cells to write
 * @throws BadRequestAppException An unknown permission key (HTTP 400, UNKNOWN_PERMISSION)
 */
export async function writeCells(tx: Prisma.TransactionClient, roleId: string, cells: RoleCellInput[]): Promise<void> {
  const permissions = await tx.permission.findMany();
  const known = new Set(permissions.map((p) => p.code));
  const unknown = cells.find((c) => !known.has(c.permissionKey));
  if (unknown) throw new BadRequestAppException('UNKNOWN_PERMISSION', `Unknown permission ${unknown.permissionKey}`);
  const given = new Map(cells.map((c) => [c.permissionKey, c]));
  for (const p of permissions) {
    const c = given.get(p.code);
    const data = { allowed: c?.allowed ?? false, scope: c?.scope ?? null };
    await tx.rolePermission.upsert({ where: { roleId_permissionId: { roleId, permissionId: p.id } }, update: data, create: { roleId, permissionId: p.id, ...data } });
  }
}

/**
 * The first free code for a name: the code itself, then _2, _3 and so on.
 *
 * @param tx The open transaction
 * @param name The role name
 * @returns A code that no role has yet
 * @throws BadRequestAppException No free code within 999 tries (HTTP 400, ROLE_CODE_EXHAUSTED)
 */
export async function freeCode(tx: Prisma.TransactionClient, name: string): Promise<string> {
  const taken = new Set((await tx.role.findMany({ where: { code: { startsWith: codeFrom(name).slice(0, 26) } }, select: { code: true } })).map((r) => r.code));
  for (let n = 1; n < 1000; n += 1) {
    const candidate = n === 1 ? codeFrom(name) : codeFrom(name, `_${n}`);
    if (!taken.has(candidate)) return candidate;
  }
  throw new BadRequestAppException('ROLE_CODE_EXHAUSTED', 'Could not make a code for this name');
}
