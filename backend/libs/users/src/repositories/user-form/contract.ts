/**
 * @file    contract.ts
 * @module  UsersModule
 *
 * @description
 * Contract of the user form repository. In plain words: reads the data the Edit user form needs (decision L-78, to be confirmed by the team).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.28 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.28.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/repositories/user-form/contract.ts
 * @lld-synced     v0.28
 * @status         built
 */

/** One company of the form: the roles and the dates of the assignments valid today. */
export interface FormCompany {
  companyCode: string;
  roleIds: string[];
  validFrom: string;
  validTo: string | null;
}

/** The data of a user that the Edit form fills in (API-USR-03, part `form`). */
export interface UserFormData {
  mobile: string | null;
  departmentId: string | null;
  designationId: string | null;
  reportingManagerCode: string | null;
  companies: FormCompany[];
}

/**
 * User form repository. In plain words: one read, for the Edit user form.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-BE-01
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US004-04
 * @lld       LLD-EPIC-ADM-01 v0.28 §6.1
 * @status    built
 */
export abstract class UserFormRepository {
  /** The form data of a user, or null when the code is unknown. */
  abstract findFormData(employeeCode: string): Promise<UserFormData | null>;
}
