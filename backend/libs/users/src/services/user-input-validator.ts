/**
 * @file    user-input-validator.ts
 * @module  UsersModule
 *
 * @description
 * Rules of a user record. In plain words: checks every field and returns every problem at once, so the screen can show them all.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-003
 * @subtask        ST-ADM01-003-BE-03
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/user-input-validator.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { FieldError } from '@libs/common';
import { AuthType } from '@libs/database';
import { MastersPort } from '../ports/masters.port';
import { UserRepository } from '../repositories/user';

/** One company assignment of a user input. */
export interface CompanyRoleInput {
  companyCode: string;
  roleIds: string[];
  validFrom: Date;
  validTo?: Date | null;
}

/** The fields of a user as the create, change and import calls carry them. */
export interface UserInput {
  employeeCode: string;
  newEmployeeCode?: string;
  fullName: string;
  email: string;
  mobile?: string | null;
  departmentId: string;
  designationId: string;
  reportingManagerCode: string | null;
  signIn: AuthType;
  companies: CompanyRoleInput[];
}

/**
 * User input validator.
 *
 * In plain words: the same rules for one user and for each row of an import.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-003, US-ADM01-009
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7, FR-042.2
 *   contracts: API-USR-02, API-USR-04, API-USR-09
 *   lld:       LLD-EPIC-ADM-01 v0.24 section 6.1
 */
@Injectable()
export class UserInputValidator {
  constructor(
    private readonly masters: MastersPort,
    private readonly users: UserRepository,
  ) {}

  /**
   * Validates a user.
   *
   * In plain words: returns the list of every field problem (empty when the user is fine).
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-03
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-02, API-USR-04
 * @ac        AC-US003-01, AC-US003-05
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies MastersPort.departmentExists, designationExists, isHighestDesignation, UserRepository.findByCode
   *
   * @param input - the user fields
   * @returns The field errors
   */
  async validate(input: UserInput): Promise<FieldError[]> {
    const problems: FieldError[] = [...this.basics(input), ...this.companies(input.companies)];
    if (!(await this.masters.departmentExists(input.departmentId))) problems.push({ field: 'departmentId', message: 'Choose an existing department' });
    const designationOk = await this.masters.designationExists(input.designationId);
    if (!designationOk) problems.push({ field: 'designationId', message: 'Choose an existing designation' });
    const manager = await this.managerProblem(input, designationOk);
    if (manager) problems.push(manager);
    return problems;
  }

  /** Employee code, name, e-mail and mobile. */
  private basics(input: UserInput): FieldError[] {
    const problems: FieldError[] = [];
    if (!/^\d{5}$/.test(input.employeeCode)) problems.push({ field: 'employeeCode', message: 'The employee code is 5 digits' });
    if (input.newEmployeeCode !== undefined && !/^\d{5}$/.test(input.newEmployeeCode)) problems.push({ field: 'newEmployeeCode', message: 'The employee code is 5 digits' });
    const name = input.fullName?.trim() ?? '';
    if (name.length === 0 || name.length > 100) problems.push({ field: 'fullName', message: 'The name is required, up to 100 characters' });
    if (!input.email || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) problems.push({ field: 'email', message: 'Enter a valid e-mail address, up to 254 characters' });
    if (input.mobile && !/^[0-9+\-\s]{7,20}$/.test(input.mobile)) problems.push({ field: 'mobile', message: 'The mobile number has 7 to 20 digits, spaces, + or -' });
    return problems;
  }

  /** At least one company, each with a role, sound dates and no company twice. */
  private companies(companies: CompanyRoleInput[]): FieldError[] {
    if (!companies || companies.length === 0) return [{ field: 'companies', message: 'Add at least one company with a role' }];
    const problems: FieldError[] = [];
    const seen = new Set<string>();
    companies.forEach((c, i) => {
      if (seen.has(c.companyCode)) problems.push({ field: `companies.${i}.companyCode`, message: 'This company is listed twice' });
      seen.add(c.companyCode);
      if (!c.roleIds || c.roleIds.length === 0) problems.push({ field: `companies.${i}.roleIds`, message: 'Choose at least one role' });
      if (c.validTo && c.validTo < c.validFrom) problems.push({ field: `companies.${i}.validTo`, message: 'The end date cannot be before the start date' });
    });
    return problems;
  }

  /** The reporting manager rule (decision OP-07, L-58): required unless the highest designation; when given, an Active user. */
  private async managerProblem(input: UserInput, designationOk: boolean): Promise<FieldError | null> {
    const code = input.reportingManagerCode;
    if (code) {
      const manager = await this.users.findByCode(code);
      return manager?.status === 'ACTIVE' ? null : { field: 'reportingManagerCode', message: 'The reporting manager must be an Active user' };
    }
    if (!designationOk || (await this.masters.isHighestDesignation(input.designationId))) return null;
    return { field: 'reportingManagerCode', message: 'Choose a reporting manager (only the highest designation may have none)' };
  }
}
