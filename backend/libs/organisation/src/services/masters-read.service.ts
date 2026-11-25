/**
 * @file    masters-read.service.ts
 * @module  OrganisationModule
 *
 * @description
 * Masters read service. In plain words: gives the screens the three lists and tells whether the caller may ask for all companies (decision L-70, L-71).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.25 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.25.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/organisation/src/services/masters-read.service.ts
 * @lld-synced     v0.25
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { CompanyRow, DepartmentRow, DesignationRow, MastersReadRepository } from '../repositories/masters-read';

/**
 * Masters read service. In plain words: three reads; the companies read carries `canViewAll`, decided by the caller, not the service.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-002
 * @subtask   ST-ADM01-002-BE-01
 * @frd       FR-042.1, FR-042.2, FR-042.3, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-MST-01, API-MST-02, API-MST-03
 * @ac        AC-US002-02
 * @lld       LLD-EPIC-ADM-01 v0.25 §6.3
 * @status    built
 *
 * @dependencies MastersReadRepository
 *
 * @returns The lists
 */
@Injectable()
export class MastersReadService {
  constructor(private readonly reads: MastersReadRepository) {}

  async departments(): Promise<DepartmentRow[]> {
    return this.reads.departments();
  }

  async designations(): Promise<DesignationRow[]> {
    return this.reads.designations();
  }

  async companies(canViewAll: boolean): Promise<{ items: CompanyRow[]; canViewAll: boolean }> {
    return { items: await this.reads.companies(), canViewAll };
  }
}
