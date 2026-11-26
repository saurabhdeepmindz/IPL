/**
 * @file    contract.ts
 * @module  OrganisationModule
 *
 * @description
 * Contract of the masters read repository. In plain words: the lists of departments, designations and companies that the user screens show in their drop-downs (decision L-70).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/repositories/masters-read/contract.ts
 * @lld-synced     v0.30
 * @status         built
 */

/** A department as the screens show it. */
export interface DepartmentRow {
  id: string;
  code: string;
  name: string;
}

/** A designation; `isHighest` marks the one that needs no reporting manager (L-59). */
export interface DesignationRow {
  id: string;
  code: string;
  name: string;
  isHighest: boolean;
}

/** A company. */
export interface CompanyRow {
  code: string;
  name: string;
}

/**
 * Masters read repository. In plain words: three read-only lists, ordered by name.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-BE-01
 * @frd       FR-042.1, FR-042.2, FR-042.3, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-MST-01, API-MST-02, API-MST-03
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.30 §6.3
 * @status    built
 *
 * @returns The lists
 */
export abstract class MastersReadRepository {
  /** All departments, by name. */
  abstract departments(): Promise<DepartmentRow[]>;

  /** All designations, by name. */
  abstract designations(): Promise<DesignationRow[]>;

  /** The active companies, by code. */
  abstract companies(): Promise<CompanyRow[]>;
}
