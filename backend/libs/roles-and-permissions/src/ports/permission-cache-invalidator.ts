/**
 * @file    permission-cache-invalidator.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Port to the permission cache. In plain words: the matrix save tells "forget everything" without this library knowing how the cache works (decision L-22). The application module wires `PermissionCache` (libs/core) to this class.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.10 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.10.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/ports/permission-cache-invalidator.ts
 * @lld-synced     v0.10
 * @status         built
 */

/**
 * Permission cache invalidator (port).
 *
 * In plain words: one method: clear every remembered permission answer.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-014
 *   workflows: AD-03
 *   frd:       FR-043.1, FR-043.2, FR-043.3, FR-043.6
 *   contracts: API-PRM-03
 *   lld:       LLD-EPIC-ADM-01 v0.10 §6.6
 */
export abstract class PermissionCacheInvalidator {
  /** Forgets every remembered permission answer, so the next call of every user reads the saved matrix. */
  abstract clearAll(): Promise<void>;
}
