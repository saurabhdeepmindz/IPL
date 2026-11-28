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
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/AccessSummary.tsx
 * @lld-synced     v0.30
 * @status         built
 */
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import type { CompanyRoleInput } from '../../types/user.types';

interface AccessSummaryProps {
  /** The name typed in the form */
  name?: string;
  /** The chosen sign-in method */
  signIn: 'SSO' | 'LOCAL';
  /** The rows of the form */
  companies: CompanyRoleInput[];
  /** Name of each role id */
  roleNames: Record<string, string>;
  /** "Company name · code" of each company code (the code alone when not known) */
  companyNames?: Record<string, string>;
}

/**
 * AccessSummary.
 *
 * In plain words: the "Access summary" card beside the form: who signs in how, and the companies with their roles; a warning while no company has a role.
 */
export function AccessSummary({ name, signIn, companies, roleNames, companyNames = {} }: AccessSummaryProps) {
  const lines = companies.filter((c) => c.companyCode && c.roleIds.length > 0).map((c) => ({ company: companyNames[c.companyCode] ?? c.companyCode, roles: c.roleIds.map((id) => roleNames[id] ?? id).join(', ') }));
  return (
    <aside className={hf('card')} aria-label="Access summary" data-testid="user-access-summary" style={{ position: 'sticky', top: 96 }}>
      <div className={hf('card-head')}>
        <h3>Access summary</h3>
      </div>
      <div className={hf('card-body')} style={{ fontSize: 'var(--fs-2)' }}>
        <p style={{ margin: '0 0 var(--spacing-md)' }}>
          <b>{name?.trim() || 'This user'}</b> will sign in with <b>{signIn === 'SSO' ? 'IPL single sign-on' : 'a local password'}</b> and can work in:
        </p>
        {lines.length === 0 ? (
          <div className={hf('alert warning')} style={{ marginBottom: 'var(--spacing-md)' }}>
            <span>
              <HfIcon name="alert" size="sm" />
            </span>
            <div>No company access yet.</div>
          </div>
        ) : (
          <ul style={{ margin: '0 0 var(--spacing-md)', paddingLeft: 18, lineHeight: '22px' }}>
            {lines.map((l) => (
              <li key={l.company}>
                <b>{l.company}</b>: {l.roles}
              </li>
            ))}
          </ul>
        )}
        <hr className={hf('divider')} style={{ margin: 'var(--spacing-md) 0' }} />
        <div className={hf('muted')} style={{ fontSize: 'var(--fs-1)', lineHeight: '18px' }}>
          What each role can do is set in Role Management and Permission Management. Being a final approver comes from the DoA matrix, not from a role.
        </div>
      </div>
    </aside>
  );
}
