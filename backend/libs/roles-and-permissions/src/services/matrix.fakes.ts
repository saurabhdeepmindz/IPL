/**
 * @file    matrix.fakes.ts
 * @module  RolesAndPermissionsModule
 *
 * @description
 * Test helpers of the matrix service spec. In plain words: a small fake matrix (three roles, four permissions) and in-memory stand-ins for the cell repository, the version repository, the cache port and the audit service.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-014
 * @subtask        ST-ADM01-014-BE-04
 * @lld            LLD-EPIC-ADM-01 v0.17 §6.6
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.17.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/roles-and-permissions/src/services/matrix.fakes.ts
 * @lld-synced     v0.17
 * @status         built
 */

import { RoleStatus } from '@libs/database';
import { StaleMatrixException } from '../errors/stale-matrix.exception';
import { CellWrite } from '../repositories/permission-matrix-version';
import { MatrixCell, MatrixData } from '../repositories/role-permission';
import { FakeRoleRepo, roleRecord } from './roles.fakes';

type Scope = 'OWN' | 'DEPARTMENT' | 'COMPANY' | null;

/** The fake roles: Administrator (locked), Initiator (standard, 2 users), and an Inactive one. */
export const matrixRoles = () => [
  roleRecord({ id: 'admin', name: 'Administrator', code: 'ADMINISTRATOR', type: 'STANDARD', isLocked: true, userCount: 1 }),
  roleRecord({ id: 'init', name: 'Initiator', code: 'INITIATOR', type: 'STANDARD', userCount: 2 }),
  roleRecord({ id: 'old', name: 'Old role', code: 'OLD', status: RoleStatus.INACTIVE }),
];

/** Role repository fake with the matrix roles; the user counts come from the records. */
export class MatrixRoleRepo extends FakeRoleRepo {
  constructor() {
    super();
    this.roles = matrixRoles();
    this.holders = { admin: 1, init: 2 };
  }
}

const cell = (roleId: string, key: string, allowed: boolean, scope: Scope = null): MatrixCell => ({ roleId, key, allowed, scope });

/** Cell repository fake. */
export class MatrixCellRepo {
  data: MatrixData = {
    permissions: [
      { key: 'users.view', module: 'users', label: 'See users' },
      { key: 'users.manage', module: 'users', label: 'Manage users' },
      { key: 'audit.view', module: 'audit', label: 'See the audit log' },
      { key: 'roles.manage', module: 'roles', label: 'Manage roles' },
    ],
    cells: [
      cell('admin', 'users.view', true, 'COMPANY'),
      cell('admin', 'users.manage', true, 'COMPANY'),
      cell('admin', 'audit.view', true, 'COMPANY'),
      cell('admin', 'roles.manage', true),
      cell('init', 'users.view', true, 'OWN'),
      cell('init', 'users.manage', false),
      cell('init', 'audit.view', false),
      cell('init', 'roles.manage', false),
    ],
  };
  async readMatrix(): Promise<MatrixData> {
    return this.data;
  }
}

/** Version repository fake: the current version and the commits made. */
export class FakeVersions {
  version = 3;
  commits: Array<{ expected: number; writes: CellWrite[]; savedBy: string; reason: string }> = [];
  async current(): Promise<number> {
    return this.version;
  }
  async commit(expected: number, writes: CellWrite[], savedBy: string, reason: string): Promise<number> {
    if (expected !== this.version) throw new StaleMatrixException();
    this.commits.push({ expected, writes, savedBy, reason });
    this.version += 1;
    return this.version;
  }
}
