/**
 * @file    UserDetailTabs.tsx
 * @module  Users
 *
 * @description
 * Details tabs. In plain words: Overview, Companies and roles, Activity (decisions D-3, D-4, D-5).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-006
 * @subtask        ST-ADM01-006-FE-02
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.3
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserDetailTabs.tsx
 * @lld-synced     v0.27
 * @status         built
 */
'use client';

import { Tabs } from '@/components/ui';
import { formatDay } from '@/lib/utils';
import type { UserDetails } from '../types/user.types';

/** Props of UserDetailTabs. */
interface UserDetailTabsProps {
  /** The user with the data of API-USR-03 */
  user: UserDetails;
}

/**
 * Details tabs. In plain words: Overview lists code, e-mail, department, designation, reporting manager (code only) and sign-in; Companies and roles lists company, roles, valid from and valid to; Activity lists the recent changes.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-006
 * @subtask   ST-ADM01-006-FE-02
 * @frd       FR-042.1, FR-042.4
 * @workflow  AD-02
 * @screen    ADM-01
 * @contract  API-USR-03
 * @ac        AC-US006-01
 * @lld       LLD-EPIC-ADM-01 v0.27 §6.3
 * @status    built
 *
 * @dependencies Tabs
 *
 * @returns The rendered output
 */
export function UserDetailTabs({ user }: UserDetailTabsProps) {
  const dates = new Map((user.form?.companies ?? []).map((c) => [c.companyCode, c]));
  const overview = (
    <dl className="row mt-3" data-testid="user-overview">
      <dt className="col-sm-3">Employee code</dt>
      <dd className="col-sm-9">{user.employeeCode}</dd>
      <dt className="col-sm-3">Official e-mail</dt>
      <dd className="col-sm-9">{user.email}</dd>
      <dt className="col-sm-3">Department</dt>
      <dd className="col-sm-9">{user.department ?? '-'}</dd>
      <dt className="col-sm-3">Designation</dt>
      <dd className="col-sm-9">{user.designation ?? '-'}</dd>
      <dt className="col-sm-3">Reporting manager</dt>
      <dd className="col-sm-9">{user.form?.reportingManagerCode ?? '-'}</dd>
      <dt className="col-sm-3">Sign-in</dt>
      <dd className="col-sm-9">
        {user.signIn === 'SSO' ? 'IPL single sign-on' : 'Local password'} · last sign-in {user.lastSignIn ? formatDay(user.lastSignIn) : 'Never'}
      </dd>
    </dl>
  );
  const companies = (
    <table className="table mt-3">
      <thead>
        <tr>
          <th scope="col">Company</th>
          <th scope="col">Roles</th>
          <th scope="col">Valid from</th>
          <th scope="col">Valid to</th>
        </tr>
      </thead>
      <tbody>
        {user.companies.map((c) => (
          <tr key={c.code}>
            <td>{c.code}</td>
            <td>{c.roles.join(', ')}</td>
            <td>{dates.get(c.code)?.validFrom ?? '-'}</td>
            <td>{dates.get(c.code)?.validTo ?? 'No end date'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  const activity = user.activity.length === 0 ? (
    <p className="mt-3">No changes recorded yet.</p>
  ) : (
    <ul className="mt-3">
      {user.activity.map((a) => (
        <li key={`${a.at}-${a.text}`}>
          {formatDay(a.at)} · {a.text}
        </li>
      ))}
    </ul>
  );
  return (
    <Tabs
      ariaLabel="User details"
      defaultValue="overview"
      tabs={[
        { id: 'overview', label: 'Overview', panel: overview },
        { id: 'companies', label: 'Companies and roles', panel: companies },
        { id: 'activity', label: 'Activity', panel: activity },
      ]}
    />
  );
}
