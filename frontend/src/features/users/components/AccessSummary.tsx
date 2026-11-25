/**
 * @file    AccessSummary.tsx
 * @module  UsersFeature
 *
 * @description
 * The access summary. In plain words: says in plain words how the user signs in and where they can work (decision L-72).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-004
 * @subtask        ST-ADM01-004-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.24 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.24.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/AccessSummary.tsx
 * @lld-synced     v0.24
 * @status         built
 */
import type { CompanyRoleInput } from '../types/user.types';

/** Props of AccessSummary. */
interface AccessSummaryProps {
  /** The chosen sign-in method */
  signIn: 'SSO' | 'LOCAL';
  /** The rows of the form */
  companies: CompanyRoleInput[];
  /** Name of each role id */
  roleNames: Record<string, string>;
}

/**
 * Access summary. In plain words: says how the user signs in and where they can work, computed on the screen (decision L-72).
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-004
 * @subtask   ST-ADM01-004-FE-02
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-01
 * @ac        AC-US004-03
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.3
 * @status    built
 *
 * @returns The rendered panel
 */
export function AccessSummary({ signIn, companies, roleNames }: AccessSummaryProps) {
  const lines = companies.filter((c) => c.companyCode && c.roleIds.length > 0).map((c) => `${c.companyCode}: ${c.roleIds.map((id) => roleNames[id] ?? id).join(', ')}`);
  return (
    <aside className="card p-3" aria-label="Access summary" data-testid="user-access-summary">
      <h2 className="h5">Access summary</h2>
      <p>
        This user will sign in with <strong>{signIn === 'SSO' ? 'IPL single sign-on' : 'a local password'}</strong> and can work in:
      </p>
      {lines.length === 0 ? (
        <p className="alert alert-warning mb-0">No company access yet.</p>
      ) : (
        <ul className="list-unstyled mb-0">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}
