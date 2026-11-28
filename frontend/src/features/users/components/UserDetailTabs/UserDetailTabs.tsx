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
 * @lld            LLD-EPIC-ADM-01 v0.30 §6.3
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/src/features/users/components/UserDetailTabs.tsx
 * @lld-synced     v0.30
 * @status         built
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { hf } from '@/hf/hf';
import { HfIcon } from '@/hf/HfIcon';
import { formatDay } from '@/lib/utils';
import { useCompanies } from '../../hooks/useMasters';
import { useUser } from '../../hooks/useUser';
import type { UserDetails } from '../../types/user.types';

interface UserDetailTabsProps {
  /** The user with the data of API-USR-03 */
  user: UserDetails;
}

/** The reporting manager as the design shows it: name, code and designation (the code alone while the name is not known). */
function ManagerLine({ code }: { code: string | null | undefined }) {
  const manager = useUser(code ?? undefined).data;
  if (!code) return <>-</>;
  return <>{manager ? `${manager.name} (${code})${manager.designation ? ` · ${manager.designation}` : ''}` : code}</>;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'companies', label: 'Companies and roles' },
  { id: 'activity', label: 'Activity' },
];

/**
 * UserDetailTabs.
 *
 * In plain words: the three tabs of the user details in the design: Overview (the facts), Companies and roles (a table with the roles as links and the valid dates) and Activity (the feed of changes).
 */
export function UserDetailTabs({ user }: UserDetailTabsProps) {
  const [tab, setTab] = useState('overview');
  const companyNames = Object.fromEntries((useCompanies().data?.items ?? []).map((c) => [c.code, `${c.name} · ${c.code}`]));
  const dates = new Map((user.form?.companies ?? []).map((c) => [c.companyCode, c]));
  return (
    <>
      <div className={hf('tabs')} role="tablist" aria-label="User details">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className={hf('card-body')}>
          <dl className={hf('dl')} data-testid="user-overview">
            <dt>Employee code</dt>
            <dd className={hf('mono')}>{user.employeeCode}</dd>
            <dt>Official e-mail</dt>
            <dd>{user.email}</dd>
            <dt>Department</dt>
            <dd>{user.department ?? '-'}</dd>
            <dt>Designation</dt>
            <dd>{user.designation ?? '-'}</dd>
            <dt>Reporting manager</dt>
            <dd>
              <ManagerLine code={user.form?.reportingManagerCode} />
            </dd>
            <dt>Sign-in</dt>
            <dd>
              {user.signIn === 'SSO' ? 'IPL single sign-on' : 'Local password'} · last sign-in {user.lastSignIn ? formatDay(user.lastSignIn) : 'Never'}
            </dd>
            <dt>Delegation</dt>
            <dd>Coming soon</dd>
          </dl>
        </div>
      )}
      {tab === 'companies' && (
        <div id="panel-companies" role="tabpanel" aria-labelledby="tab-companies" className={hf('card-body')}>
          {user.companies.length === 0 ? (
            <div className={hf('empty')} style={{ padding: 'var(--spacing-3xl)' }}>
              <span className={hf('art')}>
                <HfIcon name="key" size="lg" />
              </span>
              <b>No company access yet</b>
              <p>This user can sign in but cannot see any company until a role is given.</p>
              <Link className={hf('btn btn-primary')} href={`/users/${user.employeeCode}/edit`}>
                Give access
              </Link>
            </div>
          ) : (
            <div className={hf('table-wrap')}>
              <table className={hf('tbl')}>
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
                      <td>
                        <b>{companyNames[c.code] ?? c.code}</b>
                      </td>
                      <td>
                        <div className={hf('chips')}>
                          {c.roles.map((r) => (
                            <span key={r} className={hf('chip sel')}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{dates.get(c.code)?.validFrom ?? '-'}</td>
                      <td>{dates.get(c.code)?.validTo ?? 'No end date'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === 'activity' && (
        <div id="panel-activity" role="tabpanel" aria-labelledby="tab-activity" className={hf('card-body')}>
          {user.activity.length === 0 ? (
            <p>No changes recorded yet.</p>
          ) : (
            <ul className={hf('feed')}>
              {user.activity.map((a) => (
                <li key={`${a.at}-${a.text}`}>
                  <span className={hf('fi')}>
                    <HfIcon name="shield" size="sm" />
                  </span>
                  <div>
                    {a.text}
                    <time>{formatDay(a.at)}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
