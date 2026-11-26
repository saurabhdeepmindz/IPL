/**
 * @file    user-response.dto.ts
 * @module  UsersApi
 *
 * @description
 * Answer shapes of the user routes. In plain words: a user in the list, the details, and the small answers of create, deactivate, unlock and the password routes.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001, US-ADM01-003, US-ADM01-005, US-ADM01-007
 * @subtask        ST-ADM01-001-BE-01, ST-ADM01-003-BE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/apps/ams-apis/src/dtos/users/user-response.dto.ts
 * @lld-synced     v0.30
 * @status         built
 */

/**
 * User answers.
 *
 * In plain words: plain shapes with no logic.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-001, US-ADM01-003, US-ADM01-005, US-ADM01-007
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7, FR-042.1, FR-042.4, FR-042.1, FR-042.4, FR-042.6, FR-043.2
 *   contracts: API-USR-01 to API-USR-08
 *   lld:       LLD-EPIC-ADM-01 v0.29 section 6.1
 */
export class UserCompaniesDto {
  code!: string;
  roles!: string[];
}

export class UserListItemDto {
  employeeCode!: string;
  name!: string;
  email!: string;
  department!: string | null;
  designation!: string | null;
  companies!: UserCompaniesDto[];
  signIn!: 'SSO' | 'LOCAL';
  status!: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  /** ISO 8601, UTC; null until the sign-in epic records it (decision L-45). */
  lastSignIn!: string | null;
}

export class UserListDto {
  items!: UserListItemDto[];
  counts!: { all: number; active: number; inactive: number; locked: number };
  page!: number;
  pageSize!: number;
  total!: number;
}

/** The data the Edit form needs (API-USR-03, part `form`, decision L-78). */
export class UserFormDto {
  mobile!: string | null;
  departmentId!: string | null;
  designationId!: string | null;
  reportingManagerCode!: string | null;
  companies!: Array<{ companyCode: string; roleIds: string[]; validFrom: string; validTo: string | null }>;
}

export class UserDetailsDto extends UserListItemDto {
  form!: UserFormDto | null;
  firstSignInAt!: string | null;
  signInLocked!: boolean;
  summaryText!: string;
  activity!: Array<{ at: string; text: string }>;
}

export class CreateUserResultDto {
  employeeCode!: string;
  status!: 'ACTIVE';
  oneTimePassword!: { required: boolean; emailStatus: 'SENT' | 'FAILED' | null };
}

export class EmailStatusDto {
  emailStatus!: 'SENT' | 'FAILED';
}

export class UserStatusDto {
  status!: 'ACTIVE' | 'INACTIVE';
}
