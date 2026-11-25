/**
 * @file    roles.service.ts
 * @module  RolesFeature
 *
 * @description
 * Role API functions. In plain words: one function per contract, using the shared API client. The permission catalog comes from the matrix read (API-PRM-01).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.20 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/services/roles.service.ts
 * @lld-synced     v0.20
 * @status         elaborated
 */

import { api } from '@/lib/api-client';
import type { CatalogCell, PermissionCatalog, Role, RoleDetails, SaveRoleInput } from '../types/role.types';

/**
 * List roles. In plain words: the roles with type, users, last changed and status; the filters are sent as the query.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-01
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The roles and the paging
 */
export async function listRoles(query: { q?: string; type?: string; status?: string }): Promise<{ items: Role[] }> {
  const res = await api.get<{ data: { items: Role[] } }>('/roles', { params: query });
  return { items: res.data.data.items };
}

/**
 * Read the permission catalog. In plain words: the permissions by module and the cells of a role, from the matrix read.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-PRM-01
 * @ac        AC-US012-02
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The modules with their permissions and the cells
 */
export async function getPermissionCatalog(): Promise<PermissionCatalog> {
  const res = await api.get<{ data: { groups: { module: string; permissions: { key: string; label: string; hint: string; cells: Record<string, CatalogCell> }[] }[]; roles: { roleId: string }[] } }>('/roles/permissions/matrix');
  const cellsByRole: PermissionCatalog['cellsByRole'] = {};
  const modules = res.data.data.groups.map((g) => ({
    name: g.module,
    permissions: g.permissions.map((p) => {
      for (const [roleId, cell] of Object.entries(p.cells)) (cellsByRole[roleId] ??= {})[p.key] = cell;
      return { key: p.key, label: p.label, hint: p.hint, scoped: Object.values(p.cells).some((c) => c.scope !== null) };
    }),
  }));
  return { modules, cellsByRole };
}

/**
 * Create a role. In plain words: saves a new role with its reason; a used name gives ROLE_NAME_EXISTS.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-02
 * @ac        AC-US012-02, AC-US012-03
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    built
 *
 * @dependencies api.post
 *
 * @returns The created role
 */
export async function createRole(input: SaveRoleInput): Promise<{ roleId: string }> {
  const res = await api.post<{ data: { roleId: string } }>('/roles', input);
  return res.data.data;
}

/**
 * Change a role. In plain words: saves the changes of a role with its reason.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-03
 * @ac        AC-US012-02, AC-US012-04
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    built
 *
 * @dependencies api.put
 *
 * @returns The changed role
 */
export async function updateRole(roleId: string, input: SaveRoleInput): Promise<Role> {
  const res = await api.put<{ data: Role }>(`/roles/${roleId}`, input);
  return res.data.data;
}

/**
 * Deactivate a role. In plain words: sets a role Inactive; a role that users hold gives ROLE_IN_USE with the count.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-04
 * @ac        AC-US012-05
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    built
 *
 * @dependencies api.post
 *
 * @returns Nothing
 */
export async function deactivateRole(roleId: string, reason: string): Promise<void> {
  await api.post(`/roles/${roleId}/deactivate`, { reason });
}

/**
 * Read one role. In plain words: the role, its holders by company and what it allows.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-05
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    pseudo
 *
 * @dependencies api.get
 *
 * @returns The role details
 */
export async function getRole(_roleId: string, _companyCode?: string): Promise<RoleDetails> {
  // TODO: 1. GET /roles/:roleId with the optional company filter.
  throw new Error('pseudo-code: not implemented');
}

/**
 * Give a role to users. In plain words: assigns the role to users in a company from a date, with a reason.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-ROL-06
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.20 §6.5
 * @status    pseudo
 *
 * @dependencies api.post
 *
 * @returns How many were assigned
 */
export async function assignUsers(_roleId: string, _input: { employeeCodes: string[]; companyCode: string; validFrom: string; reason: string }): Promise<{ assigned: number }> {
  // TODO: 1. POST /roles/:roleId/users with the input.
  throw new Error('pseudo-code: not implemented');
}
