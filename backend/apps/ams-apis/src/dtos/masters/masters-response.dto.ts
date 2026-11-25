/**
 * @file    masters-response.dto.ts
 * @module  AmsApis
 *
 * @description
 * Answers of the masters reads. In plain words: the shape of the three lists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-002
 * @subtask        ST-ADM01-002-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/masters/masters-response.dto.ts
 * @lld-synced     v0.24
 * @status         built
 */

/** One department (API-MST-01). */
export class DepartmentDto {
  id!: string;
  code!: string;
  name!: string;
}

/** One designation (API-MST-02). */
export class DesignationDto extends DepartmentDto {
  isHighest!: boolean;
}

/** One company (API-MST-03). */
export class CompanyDto {
  code!: string;
  name!: string;
}

/** The companies answer (API-MST-03). */
export class CompaniesDto {
  items!: CompanyDto[];
  canViewAll!: boolean;
}
