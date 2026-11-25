/**
 * @file    sensitive-rights.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Sensitive rights and the order of data scopes. In plain words: the rights that need a confirmation when they are widened, and which scope reaches further than which.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.19 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/constants/sensitive-rights.ts
 * @lld-synced     v0.19
 * @status         built
 */

/** Rights that need `confirmSensitive` when they are given to, or widened for, a role other than Administrator (decision L-20). */
export const SENSITIVE_RIGHTS: readonly string[] = ['users.manage', 'roles.manage', 'audit.view', 'companies.view-all'];

/** How far each data scope reaches; a bigger number reaches further. */
export const SCOPE_RANK: Readonly<Record<string, number>> = { OWN: 1, DEPARTMENT: 2, COMPANY: 3 };
