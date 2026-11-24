/**
 * @file    company-filter.extension.ts
 * @module  DatabaseModule
 *
 * @description
 * Prisma client extension that adds the session company to every read and write of a company-specific table.
 * In plain words: code that forgets to filter by company still cannot see or change another company's rows.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @story   US-ADM01-017
 * @subtask ST-ADM01-000-BE-02
 */

import { Prisma } from '../generated/client';
import { CompanyContext } from '../company-context';

/** Company-specific models and the column that holds the company code. */
export const COMPANY_MODELS: Record<string, string> = {
  UserCompanyRole: 'companyCode',
};

type Args = { where?: Record<string, unknown>; data?: Record<string, unknown> | Record<string, unknown>[] };

/**
 * Build the where-fragment that pins a query to the session company.
 *
 * In plain words: combines what the caller asked with "and company is the session company".
 *
 * @param field Column that holds the company
 * @param company Session company
 * @param where The caller's own where
 * @returns The combined where
 * @dependencies none
 */
function pin(field: string, company: string, where?: Record<string, unknown>): Record<string, unknown> {
  return where ? { AND: [where, { [field]: company }] } : { [field]: company };
}

/**
 * Check or fill the company of data being written.
 *
 * In plain words: fills the company when it is missing and refuses a different one.
 *
 * @param field Column that holds the company
 * @param company Session company
 * @param row One row of data
 * @returns The row with the company set
 * @dependencies none
 */
function stamp(field: string, company: string, row: Record<string, unknown>): Record<string, unknown> {
  const given = row[field];
  if (given !== undefined && given !== company) {
    throw new Error(`Write refused: company ${String(given)} is not the session company ${company}`);
  }
  return { ...row, [field]: company };
}

/**
 * The extension itself.
 *
 * In plain words: attach it with `client.$extends(companyFilterExtension)`. When no company is set (seeds, background jobs) nothing is filtered.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export const companyFilterExtension = Prisma.defineExtension({
  name: 'company-filter',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const field = COMPANY_MODELS[model];
        const company = CompanyContext.current();
        if (!field || !company) return query(args);
        const a = args as Args;
        switch (operation) {
          case 'findMany':
          case 'findFirst':
          case 'findFirstOrThrow':
          case 'count':
          case 'aggregate':
          case 'groupBy':
          case 'update':
          case 'updateMany':
          case 'updateManyAndReturn':
          case 'delete':
          case 'deleteMany':
          case 'findUnique':
          case 'findUniqueOrThrow':
            a.where = pin(field, company, a.where);
            break;
          case 'create':
            a.data = stamp(field, company, a.data as Record<string, unknown>);
            break;
          case 'createMany':
          case 'createManyAndReturn':
            a.data = (a.data as Record<string, unknown>[]).map((r) => stamp(field, company, r));
            break;
          case 'upsert':
            a.where = pin(field, company, a.where);
            break;
          default:
            break;
        }
        return query(a);
      },
    },
  },
});
