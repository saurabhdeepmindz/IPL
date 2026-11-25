/**
 * @file    masters.service.ts
 * @module  UsersFeature
 *
 * @description
 * Masters read calls. In plain words: the drop-down lists of the user screens (decision L-70).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002, US-ADM01-004
 * @subtask        ST-ADM01-002-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.29 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/services/masters.service.ts
 * @lld-synced     v0.29
 * @status         built
 */
import { api } from '@/lib/api-client';
import type { CompanyItem, MasterItem } from '../types/user.types';

/**
 * Departments. In plain words: all departments by name.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-MST-01
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The departments
 */
export async function getDepartments(): Promise<MasterItem[]> {
  const res = await api.get<{ data: { items: MasterItem[] } }>('/masters/departments');
  return res.data.data.items;
}

/**
 * Designations. In plain words: all designations by name, with `isHighest`.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-MST-02
 * @ac        AC-US004-05
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The designations
 */
export async function getDesignations(): Promise<MasterItem[]> {
  const res = await api.get<{ data: { items: MasterItem[] } }>('/masters/designations');
  return res.data.data.items;
}

/**
 * Companies. In plain words: the active companies and whether the caller may ask for all of them (decision L-71).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-MST-03
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies api.get
 *
 * @returns The companies and canViewAll
 */
export async function getCompanies(): Promise<{ items: CompanyItem[]; canViewAll: boolean }> {
  const res = await api.get<{ data: { items: CompanyItem[]; canViewAll: boolean } }>('/masters/companies');
  return res.data.data;
}
