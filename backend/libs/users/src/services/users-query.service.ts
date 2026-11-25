/**
 * @file    users-query.service.ts
 * @module  UsersModule
 *
 * @description
 * Reading users. In plain words: the user list with search, filters and counts, and one user with their access summary and activity.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-001, US-ADM01-003
 * @subtask        ST-ADM01-001-BE-02, ST-ADM01-003-BE-02
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/users-query.service.ts
 * @lld-synced     v0.30
 * @status         built
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '@libs/audit';
import { UserStatus } from '@libs/database';
import { UserFilter, UserRecord, UserRepository } from '../repositories/user';
import { UserFormData, UserFormRepository } from '../repositories/user-form';
import { UnknownUserException } from '../errors/unknown-user.exception';

/** The list filters of the call. */
export interface ListInput {
  status?: 'all' | 'active' | 'inactive' | 'locked';
  q?: string;
  departmentId?: string;
  roleId?: string;
  signIn?: 'SSO' | 'LOCAL';
  page: number;
  pageSize: number;
  sort: string;
}

/** Who is asking and for which company. */
export interface ListContext {
  sessionCompany: string;
  allCompanies: boolean;
  actor: string;
}

/** The list answer. */
export interface UserList {
  items: UserRecord[];
  counts: { all: number; active: number; inactive: number; locked: number };
  page: number;
  pageSize: number;
  total: number;
}

/** One user with what the details screen shows. */
export interface UserDetails {
  user: UserRecord;
  signInLocked: boolean;
  summaryText: string;
  activity: Array<{ at: Date; text: string }>;
  /** The data the Edit form needs (decision L-78). */
  form: UserFormData | null;
}

/**
 * Users query service.
 *
 * In plain words: reads only; nothing here changes a user.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-001, US-ADM01-003
 *   workflows: AD-03
 *   frd:       FR-042.1, FR-042.3, FR-042.4, FR-042.7, FR-042.1, FR-042.4, FR-042.6, FR-043.2
 *   contracts: API-USR-01, API-USR-03
 *   lld:       LLD-EPIC-ADM-01 v0.24 section 6.1
 */
@Injectable()
export class UsersQueryService {
  constructor(
    private readonly users: UserRepository,
    private readonly audit: AuditService,
    private readonly forms: UserFormRepository,
  ) {}

  /**
   * Searches users.
   *
   * In plain words: one page of the users of the session company (or of every company when the Administrator asks for ALL), with the counts of the four tabs.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-001
 * @subtask   ST-ADM01-001-BE-02
 * @frd       FR-042.1, FR-042.4, FR-042.6, FR-043.2
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-01
 * @ac        AC-US001-01, AC-US001-02, AC-US001-03
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UserRepository.findPage, countByStatus, AuditService.recordChange
   *
   * @param input - status tab, text, filters, paging
   * @param ctx - session company, whether ALL was allowed by the company guard, and the actor
   * @returns Items, counts, page, page size and total
   */
  async search(input: ListInput, ctx: ListContext): Promise<UserList> {
    const companyCode = ctx.allCompanies ? null : ctx.sessionCompany;
    const status = input.status && input.status !== 'all' ? (input.status.toUpperCase() as UserStatus) : undefined;
    const { page, pageSize, sort, q, departmentId, roleId, signIn } = input;
    const rest = { q, departmentId, roleId, signIn };
    const filter: UserFilter = { companyCode, ...(status ? { status } : {}), ...rest };
    const [found, counts] = await Promise.all([this.users.findPage(filter, { page, pageSize, sort }), this.users.countByStatus(filter)]);
    if (ctx.allCompanies) {
      const filters = { ...rest, ...(status ? { status } : {}) };
      await this.audit.recordChange({ actor: ctx.actor, entity: 'UserList', entityKey: 'ALL', after: { filters }, reason: 'List of every company' });
    }
    return { items: found.rows, counts: { all: counts.ACTIVE + counts.INACTIVE + counts.LOCKED, active: counts.ACTIVE, inactive: counts.INACTIVE, locked: counts.LOCKED }, page, pageSize, total: found.total };
  }

  /**
   * Shows one user.
   *
   * In plain words: the user, whether they are locked, a plain sentence about their access, and their latest changes.
   *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-003
 * @subtask   ST-ADM01-003-BE-02
 * @frd       FR-042.1, FR-042.3, FR-042.4, FR-042.7
 * @workflow  AD-03
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US003-03
 * @lld       LLD-EPIC-ADM-01 v0.24 §6.1
 * @status    built
   *
   * @dependencies UserRepository.findByCode, AuditService.recentChanges
   *
   * @param employeeCode - the user
   * @returns The user details
   * @throws UnknownUserException - no such user (HTTP 404, USER_NOT_FOUND)
   */
  async getDetails(employeeCode: string): Promise<UserDetails> {
    const user = await this.users.findByCode(employeeCode);
    if (!user) throw new UnknownUserException();
    const sentences = user.companies.map((c) => `Company ${c.code}: ${c.roles.join(', ')}.`);
    return {
      user,
      signInLocked: user.status === 'LOCKED',
      summaryText: sentences.length > 0 ? sentences.join(' ') : 'No company role is assigned.',
      activity: await this.audit.recentChanges('User', user.id, 10),
      form: await this.forms.findFormData(employeeCode),
    };
  }
}
