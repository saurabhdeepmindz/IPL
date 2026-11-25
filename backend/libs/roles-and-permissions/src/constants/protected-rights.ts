/**
 * @file    protected-rights.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * The Administrator role and the rights it can never lose. In plain words: one list, used by the roles service, the matrix service and the seed command, so the three never disagree. Moved here from the control-panel seed data (LLD §11, L-15).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-010
 * @subtask        ST-ADM01-010-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.4
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/constants/protected-rights.ts
 * @lld-synced     v0.20
 * @status         built
 */

/** Code of the locked Administrator role. */
export const ADMINISTRATOR_ROLE_CODE = 'ADMINISTRATOR';

/** Rights that the Administrator role can never lose (decision L-15). */
export const PROTECTED_RIGHTS: readonly string[] = ['users.manage', 'roles.manage'];
