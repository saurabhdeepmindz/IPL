/**
 * @file    users.service.ts
 * @module  UsersFeature
 *
 * @description
 * User API functions. In plain words: the user search used by the assign dialog (API-USR-01). The rest of the users feature comes with its own stories.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/services/users.service.ts
 * @lld-synced     v0.22
 * @status         built
 */
import { api } from '@/lib/api-client';

/**
 * Search users. In plain words: the users of the session company that match a text (the list call, used by the assign dialog).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The users found
 */
export async function listUsers(query: { q: string; pageSize?: number }): Promise<{ items: { employeeCode: string; name: string; department: string | null }[]; total: number }> {
  const res = await api.get<{ data: { items: { employeeCode: string; name: string; department: string | null }[]; total: number } }>('/users', { params: query });
  return { items: res.data.data.items, total: res.data.data.total };
}
