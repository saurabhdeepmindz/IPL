/**
 * @file    userFormSchema.ts
 * @module  UsersFeature
 *
 * @description
 * User form rules. In plain words: the Zod schema with the messages of the story and the same field names as the contract.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/schemas/userFormSchema.ts
 * @lld-synced     v0.26
 * @status         built
 */
import { z } from 'zod';

/**
 * User form schema. In plain words: employee code 5 digits, name up to 100, e-mail valid, department and designation chosen, at least one company with one role, valid-to not before valid-from, no company twice. The reporting manager is checked by the form because it depends on the designation.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @ac        AC-US004-01, AC-US004-05
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.3
 * @status    built
 */
const row = z.object({ companyCode: z.string(), roleIds: z.array(z.string()), validFrom: z.string(), validTo: z.string().optional() });

export const userFormSchema = z
  .object({
    employeeCode: z.string().regex(/^\d{5}$/, 'Enter 5 digits'),
    fullName: z.string().trim().min(1, 'Enter the full name').max(100, 'Up to 100 characters'),
    email: z.string().trim().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid e-mail'),
    mobile: z.string().optional(),
    departmentId: z.string().min(1, 'Choose a department'),
    designationId: z.string().min(1, 'Choose a designation'),
    reportingManagerCode: z.string().optional(),
    signIn: z.enum(['SSO', 'LOCAL']),
    companies: z.array(row),
  })
  .superRefine((v, ctx) => {
    const complete = v.companies.filter((c) => c.companyCode && c.roleIds.length > 0);
    if (complete.length === 0) ctx.addIssue({ code: 'custom', path: ['companies'], message: 'Give the user at least one company with one role' });
    const seen = new Set<string>();
    v.companies.forEach((c, i) => {
      if (c.companyCode && seen.has(c.companyCode)) ctx.addIssue({ code: 'custom', path: ['companies', i, 'companyCode'], message: 'This company is listed twice' });
      seen.add(c.companyCode);
      if (c.companyCode && !c.validFrom) ctx.addIssue({ code: 'custom', path: ['companies', i, 'validFrom'], message: 'Enter a date' });
      if (c.validTo && c.validTo < c.validFrom) ctx.addIssue({ code: 'custom', path: ['companies', i, 'validTo'], message: 'Valid-to must not be before valid-from' });
    });
  });

/** The values of the user form. */
export type UserFormValues = z.infer<typeof userFormSchema>;
