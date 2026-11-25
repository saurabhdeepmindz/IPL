/**
 * @file    roleFormSchema.ts
 * @module  RolesFeature
 *
 * @description
 * Role form rules. In plain words: the Zod schema of the form with the messages of the story.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012
 * @subtask        ST-ADM01-012-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.22 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.22.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/roles/schemas/roleFormSchema.ts
 * @lld-synced     v0.22
 * @status         built
 */
import { z } from 'zod';

/**
 * Role form schema. In plain words: name required and up to 40 characters, description required, status Active or Draft. The reason is not part of this form: the reason dialog asks for it.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-02, AC-US012-03, AC-US012-06
 * @lld       LLD-EPIC-ADM-01 v0.22 §6.5
 * @status    built
 */
export const roleFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a unique name up to 40 characters').max(40, 'Enter a unique name up to 40 characters'),
  description: z.string().trim().min(1, 'Enter a description'),
  status: z.enum(['ACTIVE', 'DRAFT']),
  copyFromRoleId: z.string().optional(),
});

/** The values of the role form. */
export type RoleFormValues = z.infer<typeof roleFormSchema>;
