'use client';

/**
 * @file    useImportReference.ts
 * @module  UsersImport
 *
 * @description
 * The lists for the wizard. In plain words: departments, designations, companies (from the users feature) and roles (from the roles feature) as one answer.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-009
 * @subtask        ST-ADM01-009-IN-04
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.2
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users-import/hooks/useImportReference.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { useCompanies, useDepartments, useDesignations } from '@/features/users';
import { useRoles } from '@/features/roles';
import type { Reference } from '../types/import.types';

const isForbidden = (error: unknown): boolean => (error as { status?: number } | null)?.status === 403;

/**
 * Reads the four lists.
 *
 * @story    US-ADM01-009
 * @subtask  ST-ADM01-009-IN-04
 * @returns `{ reference, isPending, forbidden, isError }`; `forbidden` is true when any list answers 403
 */
export function useImportReference(): { reference: Reference | null; isPending: boolean; forbidden: boolean; isError: boolean } {
  const departments = useDepartments();
  const designations = useDesignations();
  const companies = useCompanies();
  const roles = useRoles({ status: 'ACTIVE' });
  const all = [departments, designations, companies, roles];
  const ready = departments.data && designations.data && companies.data && roles.data;
  return {
    reference: ready ? { departments: departments.data!, designations: designations.data!, companies: companies.data!.items, roles: roles.data!.items.map((r) => ({ roleId: r.roleId, name: r.name })) } : null,
    isPending: all.some((q) => q.isPending),
    forbidden: all.some((q) => isForbidden(q.error)),
    isError: all.some((q) => q.isError),
  };
}
